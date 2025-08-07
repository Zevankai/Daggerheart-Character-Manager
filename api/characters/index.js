const { requireAuth } = require('../lib/auth.js');
const { getDb } = require('../lib/database.js');
const { v4: uuidv4 } = require('uuid');

async function getCharacters(req, res) {
  try {
    const sql = getDb();
    
    // Get all characters for the user, with active character first
    const characters = await sql`
      SELECT id, name, character_data, is_shared, share_token, is_active, created_at, updated_at
      FROM characters
      WHERE user_id = ${req.user.id}
      ORDER BY is_active DESC, updated_at DESC
    `;
    
    // Also get user's active character info
    const userInfo = await sql`
      SELECT active_character_id
      FROM users
      WHERE id = ${req.user.id}
    `;
    
    res.status(200).json({ 
      characters,
      activeCharacterId: userInfo[0]?.active_character_id || null
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
}

async function getActiveCharacter(req, res) {
  try {
    const sql = getDb();
    
    // Get user's active character
    const result = await sql`
      SELECT c.id, c.name, c.character_data, c.is_shared, c.share_token, c.is_active, c.created_at, c.updated_at
      FROM characters c
      INNER JOIN users u ON u.active_character_id = c.id
      WHERE u.id = ${req.user.id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'No active character found' });
    }

    // Debug: Log what we're loading from database  
    const characterData = result[0].character_data;
    console.log(`📀 LOADING FROM DATABASE - Character ${result[0].id}:`, {
      hope: characterData?.hope,
      hp: characterData?.hp?.circles?.map(c => c.active),
      hpActiveCount: characterData?.hp?.circles?.filter(c => c.active).length
    });
    
    res.status(200).json({ character: result[0] });
  } catch (error) {
    console.error('Error fetching active character:', error);
    res.status(500).json({ error: 'Failed to fetch active character' });
  }
}

async function createCharacter(req, res) {
  try {
    const sql = getDb();
    const { name, characterData = {}, setAsActive = true } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    // Use transaction for character creation
    const results = await sql.transaction([
      sql`
        INSERT INTO characters (user_id, name, character_data, is_active)
        VALUES (${req.user.id}, ${name.trim()}, ${JSON.stringify(characterData)}, ${setAsActive})
        RETURNING id, name, character_data, is_shared, share_token, is_active, created_at, updated_at
      `
    ]);
    
    const character = results[0][0];
    
    // Create initial save record and update user's active character if needed
    const additionalQueries = [
      sql`
        INSERT INTO character_saves (character_id, user_id, save_data, save_type)
        VALUES (${character.id}, ${req.user.id}, ${JSON.stringify(characterData)}, 'initial')
      `
    ];
    
    if (setAsActive) {
      additionalQueries.push(sql`
        UPDATE users 
        SET active_character_id = ${character.id}
        WHERE id = ${req.user.id}
      `);
    }
    
    await sql.transaction(additionalQueries);
    
    res.status(201).json({ character });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
}

async function setActiveCharacter(req, res) {
  try {
    const sql = getDb();
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: 'Character ID is required' });
    }
    
    // Verify character belongs to user
    const character = await sql`
      SELECT id FROM characters
      WHERE id = ${characterId} AND user_id = ${req.user.id}
    `;
    
    if (character.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Use transaction to set active character
    await sql.transaction([
      sql`
        UPDATE characters 
        SET is_active = FALSE 
        WHERE user_id = ${req.user.id}
      `,
      sql`
        UPDATE characters 
        SET is_active = TRUE 
        WHERE id = ${characterId} AND user_id = ${req.user.id}
      `,
      sql`
        UPDATE users 
        SET active_character_id = ${characterId}
        WHERE id = ${req.user.id}
      `
    ]);
    
    // Return updated character info
    const updatedCharacter = await sql`
      SELECT id, name, character_data, is_shared, share_token, is_active, created_at, updated_at
      FROM characters
      WHERE id = ${characterId}
    `;
    
    res.status(200).json({ 
      character: updatedCharacter[0],
      message: 'Active character updated successfully'
    });
    
  } catch (error) {
    console.error('Error setting active character:', error);
    res.status(500).json({ error: 'Failed to set active character' });
  }
}

async function autoSaveCharacter(req, res) {
  try {
    const sql = getDb();
    const { characterId, characterData } = req.body;
    
    if (!characterId || !characterData) {
      return res.status(400).json({ error: 'Character ID and data are required' });
    }
    
    // Verify character belongs to user
    const character = await sql`
      SELECT id FROM characters
      WHERE id = ${characterId} AND user_id = ${req.user.id}
    `;
    
    if (character.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Debug: Log what we're saving to database
    console.log(`📀 SAVING TO DATABASE - Character ${characterId}:`, {
      hope: characterData.hope,
      hp: characterData.hp?.circles?.map(c => c.active),
      hpActiveCount: characterData.hp?.circles?.filter(c => c.active).length
    });

    // Use transaction for auto-save
    await sql.transaction([
      sql`
        UPDATE characters 
        SET character_data = ${JSON.stringify(characterData)}, updated_at = NOW()
        WHERE id = ${characterId} AND user_id = ${req.user.id}
      `,
      sql`
        INSERT INTO character_saves (character_id, user_id, save_data, save_type)
        VALUES (${characterId}, ${req.user.id}, ${JSON.stringify(characterData)}, 'auto')
      `,
      sql`
        DELETE FROM character_saves 
        WHERE character_id = ${characterId} 
        AND save_type = 'auto' 
        AND id NOT IN (
          SELECT id FROM character_saves 
          WHERE character_id = ${characterId} AND save_type = 'auto'
          ORDER BY created_at DESC 
          LIMIT 10
        )
      `
    ]);
    
    res.status(200).json({ 
      message: 'Character auto-saved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error auto-saving character:', error);
    res.status(500).json({ error: 'Failed to auto-save character' });
  }
}

// TESTING FUNCTIONS
async function testDatabaseConnection(req, res) {
  try {
    const sql = getDb();
    
    // Test basic connection
    const connectionTest = await sql`SELECT 1 as test`;
    
    if (connectionTest.length === 0) {
      throw new Error('Database connection failed');
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
}

async function testCharacterSave(req, res) {
  try {
    const sql = getDb();
    const { testData = {} } = req.body;
    
    // Create a test character
    const testCharacterData = {
      name: 'Test Character - ' + new Date().toISOString(),
      level: 5,
      attributes: { agility: 1, strength: 2, finesse: 3, instinct: 4, presence: 5, knowledge: 6 },
      hope: { current: 3, max: 6 },
      testId: Date.now(),
      ...testData
    };
    
    // 1. Create character
    const createResult = await sql`
      INSERT INTO characters (user_id, name, character_data, is_active)
      VALUES (${req.user.id}, ${testCharacterData.name}, ${JSON.stringify(testCharacterData)}, false)
      RETURNING id, name, character_data, created_at, updated_at
    `;
    
    const character = createResult[0];
    
    // 2. Create save record
    await sql`
      INSERT INTO character_saves (character_id, user_id, save_data, save_type)
      VALUES (${character.id}, ${req.user.id}, ${JSON.stringify(testCharacterData)}, 'test')
    `;
    
    // 3. Update character data
    const updatedData = {
      ...testCharacterData,
      name: testCharacterData.name + ' (Updated)',
      level: 10,
      lastModified: new Date().toISOString()
    };
    
    const updateResult = await sql`
      UPDATE characters 
      SET character_data = ${JSON.stringify(updatedData)}
      WHERE id = ${character.id}
      RETURNING id, name, character_data, updated_at
    `;
    
    // 4. Create another save record
    await sql`
      INSERT INTO character_saves (character_id, user_id, save_data, save_type)
      VALUES (${character.id}, ${req.user.id}, ${JSON.stringify(updatedData)}, 'test')
    `;
    
    // 5. Verify data integrity
    const verifyResult = await sql`
      SELECT id, name, character_data, created_at, updated_at
      FROM characters
      WHERE id = ${character.id}
    `;
    
    const verifiedCharacter = verifyResult[0];
    const storedData = verifiedCharacter.character_data;
    
    // 6. Get save history
    const saveHistory = await sql`
      SELECT id, save_type, created_at
      FROM character_saves
      WHERE character_id = ${character.id}
      ORDER BY created_at DESC
    `;
    
    // 7. Clean up test data
    await sql.transaction([
      sql`DELETE FROM character_saves WHERE character_id = ${character.id}`,
      sql`DELETE FROM characters WHERE id = ${character.id}`
    ]);
    
    res.status(200).json({
      status: 'success',
      message: 'Character save/load test completed successfully',
      testResults: {
        characterCreated: !!character,
        characterUpdated: !!updateResult[0],
        dataIntegrity: {
          originalName: testCharacterData.name,
          updatedName: storedData.name,
          levelUpdated: storedData.level === 10,
          attributesPreserved: JSON.stringify(storedData.attributes) === JSON.stringify(testCharacterData.attributes),
          hopePreserved: JSON.stringify(storedData.hope) === JSON.stringify(testCharacterData.hope)
        },
        saveHistoryCount: saveHistory.length,
        timestamps: {
          created: character.created_at,
          updated: verifiedCharacter.updated_at,
          createdDifferent: character.created_at !== verifiedCharacter.updated_at
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Character save test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Character save test failed',
      error: error.message
    });
  }
}

async function testUserCharacters(req, res) {
  try {
    const sql = getDb();
    
    // Get user's characters
    const characters = await sql`
      SELECT id, name, character_data, is_shared, is_active, created_at, updated_at
      FROM characters
      WHERE user_id = ${req.user.id}
      ORDER BY updated_at DESC
    `;
    
    // Get user's save history
    const saveHistory = await sql`
      SELECT c.name as character_name, cs.save_type, cs.created_at
      FROM character_saves cs
      JOIN characters c ON cs.character_id = c.id
      WHERE cs.user_id = ${req.user.id}
      ORDER BY cs.created_at DESC
      LIMIT 20
    `;
    
    // Get user info
    const userInfo = await sql`
      SELECT id, username, email, active_character_id, created_at
      FROM users
      WHERE id = ${req.user.id}
    `;
    
    // Calculate data integrity stats
    const dataIntegrityStats = {
      totalCharacters: characters.length,
      activeCharacters: characters.filter(c => c.is_active).length,
      sharedCharacters: characters.filter(c => c.is_shared).length,
      charactersWithValidData: characters.filter(c => {
        try {
          const data = c.character_data;
          return data && typeof data === 'object' && data.name;
        } catch {
          return false;
        }
      }).length,
      totalSaves: saveHistory.length,
      saveTypes: saveHistory.reduce((acc, save) => {
        acc[save.save_type] = (acc[save.save_type] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.status(200).json({
      status: 'success',
      message: 'User character data retrieved successfully',
      user: userInfo[0],
      characters: characters.map(char => ({
        id: char.id,
        name: char.character_data?.name || 'Unnamed',
        level: char.character_data?.level || 1,
        isActive: char.is_active,
        isShared: char.is_shared,
        createdAt: char.created_at,
        updatedAt: char.updated_at,
        dataSize: JSON.stringify(char.character_data).length
      })),
      recentSaves: saveHistory,
      dataIntegrity: dataIntegrityStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('User characters test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'User characters test failed',
      error: error.message
    });
  }
}

async function testDatabaseSchema(req, res) {
  try {
    const sql = getDb();
    
    // Test users table
    const usersTableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    // Test characters table
    const charactersTableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'characters'
      ORDER BY ordinal_position
    `;
    
    // Test character_saves table
    const savesTableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'character_saves'
      ORDER BY ordinal_position
    `;
    
    // Test indexes
    const indexInfo = await sql`
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE tablename IN ('users', 'characters', 'character_saves')
      ORDER BY tablename, indexname
    `;
    
    // Test triggers and functions
    const triggerInfo = await sql`
      SELECT trigger_name, event_manipulation, event_object_table
      FROM information_schema.triggers
      WHERE event_object_table IN ('users', 'characters', 'character_saves')
    `;
    
    res.status(200).json({
      status: 'success',
      message: 'Database schema verification completed',
      schema: {
        users: usersTableInfo,
        characters: charactersTableInfo,
        character_saves: savesTableInfo,
        indexes: indexInfo,
        triggers: triggerInfo
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database schema test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database schema test failed',
      error: error.message
    });
  }
}

// Reset all character data for user (admin function)
async function resetAllCharacterData(req, res) {
  try {
    const sql = getDb();
    const userId = req.user.id;

    console.log(`🗑️ Resetting all data for user ${userId}...`);

    // Use transaction to ensure all operations succeed or fail together
    await sql.transaction([
      // Delete all character saves for this user
      sql`DELETE FROM character_saves WHERE user_id = ${userId}`,
      
      // Delete all characters for this user
      sql`DELETE FROM characters WHERE user_id = ${userId}`,
      
      // Reset user's active character
      sql`UPDATE users SET active_character_id = NULL WHERE id = ${userId}`
    ]);

    console.log(`✅ Successfully reset all data for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'All character data deleted successfully',
      deletedCharacters: true,
      deletedSaves: true,
      resetActiveCharacter: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to reset user data:', error);
    res.status(500).json({
      error: 'Failed to reset data',
      message: error.message
    });
  }
}

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action } = req.query;
  
  switch (req.method) {
    case 'GET':
      // Handle testing actions
      if (action === 'test-connection') {
        return testDatabaseConnection(req, res);
      } else if (action === 'test-characters') {
        return testUserCharacters(req, res);
      } else if (action === 'test-schema') {
        return testDatabaseSchema(req, res);
      } else if (action === 'active') {
        return getActiveCharacter(req, res);
      }
      // Default: get all characters
      return getCharacters(req, res);
      
    case 'POST':
      const { characterId, setActive, testData } = req.body;
      
      // Handle testing
      if (action === 'test-save') {
        return testCharacterSave(req, res);
      }
      
      // Handle setting active character
      if (setActive !== undefined || characterId && !req.body.name) {
        return setActiveCharacter(req, res);
      }
      
      // Handle auto-save
      if (characterId && req.body.characterData) {
        return autoSaveCharacter(req, res);
      }
      
      // Default: create character
      return createCharacter(req, res);
      
    case 'DELETE':
      // Handle admin reset all data
      if (action === 'reset-all') {
        return resetAllCharacterData(req, res);
      }
      return res.status(400).json({ error: 'Invalid DELETE action' });
      
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = requireAuth(handler);