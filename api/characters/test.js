const { requireAuth } = require('../lib/auth.js');
const { getDb } = require('../lib/database.js');

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
    
    // Start transaction to test full save/load cycle
    await sql.begin(async sql => {
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
      await sql`DELETE FROM character_saves WHERE character_id = ${character.id}`;
      await sql`DELETE FROM characters WHERE id = ${character.id}`;
      
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

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { action } = req.query;
  
  switch (req.method) {
    case 'GET':
      switch (action) {
        case 'connection':
          return testDatabaseConnection(req, res);
        case 'characters':
          return testUserCharacters(req, res);
        case 'schema':
          return testDatabaseSchema(req, res);
        default:
          return testDatabaseConnection(req, res);
      }
    case 'POST':
      return testCharacterSave(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = requireAuth(handler);