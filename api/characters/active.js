const { requireAuth } = require('../lib/auth.js');
const { getDb } = require('../lib/database.js');

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

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  switch (req.method) {
    case 'GET':
      return getActiveCharacter(req, res);
    case 'POST':
      return setActiveCharacter(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = requireAuth(handler);