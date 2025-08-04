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

async function createCharacter(req, res) {
  try {
    const sql = getDb();
    const { name, characterData = {}, setAsActive = true } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    // Start transaction
    await sql.begin(async sql => {
      // Create the character
      const result = await sql`
        INSERT INTO characters (user_id, name, character_data, is_active)
        VALUES (${req.user.id}, ${name.trim()}, ${JSON.stringify(characterData)}, ${setAsActive})
        RETURNING id, name, character_data, is_shared, share_token, is_active, created_at, updated_at
      `;
      
      const character = result[0];
      
      // Create initial save record for tracking
      await sql`
        INSERT INTO character_saves (character_id, user_id, save_data, save_type)
        VALUES (${character.id}, ${req.user.id}, ${JSON.stringify(characterData)}, 'manual')
      `;
      
      // If this is set as active, it will automatically deactivate others due to trigger
      // But we also need to update the user's active_character_id if not done by trigger
      if (setAsActive) {
        await sql`
          UPDATE users 
          SET active_character_id = ${character.id}
          WHERE id = ${req.user.id}
        `;
      }
      
      res.status(201).json({ character });
    });
    
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
    
    // Start transaction to set active character
    await sql.begin(async sql => {
      // Deactivate all characters for this user
      await sql`
        UPDATE characters 
        SET is_active = FALSE 
        WHERE user_id = ${req.user.id}
      `;
      
      // Activate the selected character
      await sql`
        UPDATE characters 
        SET is_active = TRUE 
        WHERE id = ${characterId} AND user_id = ${req.user.id}
      `;
      
      // Update user's active character
      await sql`
        UPDATE users 
        SET active_character_id = ${characterId}
        WHERE id = ${req.user.id}
      `;
    });
    
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
    
    res.status(200).json({ character: result[0] });
  } catch (error) {
    console.error('Error fetching active character:', error);
    res.status(500).json({ error: 'Failed to fetch active character' });
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
    
    // Start transaction for auto-save
    await sql.begin(async sql => {
      // Update character data
      await sql`
        UPDATE characters 
        SET character_data = ${JSON.stringify(characterData)}
        WHERE id = ${characterId} AND user_id = ${req.user.id}
      `;
      
      // Create save record for tracking
      await sql`
        INSERT INTO character_saves (character_id, user_id, save_data, save_type)
        VALUES (${characterId}, ${req.user.id}, ${JSON.stringify(characterData)}, 'auto')
      `;
      
      // Clean up old auto-saves (keep last 10)
      await sql`
        DELETE FROM character_saves 
        WHERE id IN (
          SELECT id FROM character_saves 
          WHERE character_id = ${characterId} AND save_type = 'auto'
          ORDER BY created_at DESC 
          OFFSET 10
        )
      `;
    });
    
    res.status(200).json({ 
      message: 'Character auto-saved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error auto-saving character:', error);
    res.status(500).json({ error: 'Failed to auto-save character' });
  }
}

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  switch (req.method) {
    case 'GET':
      return getCharacters(req, res);
    case 'POST':
      // Check if this is a set active character request
      if (req.body && req.body.hasOwnProperty('characterId') && !req.body.hasOwnProperty('name')) {
        return setActiveCharacter(req, res);
      }
      // Check if this is an auto-save request
      if (req.body && req.body.hasOwnProperty('characterId') && req.body.hasOwnProperty('characterData')) {
        return autoSaveCharacter(req, res);
      }
      return createCharacter(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = requireAuth(handler);