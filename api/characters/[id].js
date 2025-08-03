const { requireAuth } = require('../lib/auth.js');
const { getDb } = require('../lib/database.js');
const { v4: uuidv4 } = require('uuid');

async function getCharacter(req, res) {
  try {
    const sql = getDb();
    const { id } = req.query;
    
    const result = await sql`
      SELECT id, name, character_data, is_shared, share_token, created_at, updated_at
      FROM characters
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.status(200).json({ character: result[0] });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
}

async function updateCharacter(req, res) {
  try {
    console.log('🔄 updateCharacter called with:', { 
      id: req.query.id, 
      body: req.body, 
      user: req.user.id 
    });
    
    const sql = getDb();
    const { id } = req.query;
    const { name, characterData } = req.body;
    
    // Check if character exists and belongs to user
    const existingResult = await sql`
      SELECT id FROM characters
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;
    
    if (existingResult.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Build update query using proper Neon serverless syntax
    let updateQuery;
    let updateParams = [];
    
    if (name !== undefined && characterData !== undefined) {
      updateQuery = sql`
        UPDATE characters 
        SET name = ${name.trim()}, character_data = ${JSON.stringify(characterData)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${req.user.id}
        RETURNING id, name, character_data, is_shared, share_token, created_at, updated_at
      `;
    } else if (name !== undefined) {
      updateQuery = sql`
        UPDATE characters 
        SET name = ${name.trim()}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${req.user.id}
        RETURNING id, name, character_data, is_shared, share_token, created_at, updated_at
      `;
    } else if (characterData !== undefined) {
      updateQuery = sql`
        UPDATE characters 
        SET character_data = ${JSON.stringify(characterData)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${req.user.id}
        RETURNING id, name, character_data, is_shared, share_token, created_at, updated_at
      `;
    } else {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const result = await updateQuery;
    
    console.log('✅ Character updated successfully:', result[0]);
    res.status(200).json({ character: result[0] });
  } catch (error) {
    console.error('❌ Error updating character:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Failed to update character', details: error.message });
  }
}

async function deleteCharacter(req, res) {
  try {
    const sql = getDb();
    const { id } = req.query;
    
    const result = await sql`
      DELETE FROM characters
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING id
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
}

async function shareCharacter(req, res) {
  try {
    const sql = getDb();
    const { id } = req.query;
    const { isShared } = req.body;
    
    // Check if character exists and belongs to user
    const existingResult = await sql`
      SELECT id, is_shared, share_token FROM characters
      WHERE id = ${id} AND user_id = ${req.user.id}
    `;
    
    if (existingResult.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    let shareToken = existingResult[0].share_token;
    
    // Generate share token if enabling sharing and none exists
    if (isShared && !shareToken) {
      shareToken = uuidv4();
    }
    
    // Clear share token if disabling sharing
    if (!isShared) {
      shareToken = null;
    }
    
    const result = await sql`
      UPDATE characters 
      SET is_shared = ${isShared}, share_token = ${shareToken}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${req.user.id}
      RETURNING id, name, character_data, is_shared, share_token, created_at, updated_at
    `;
    
    res.status(200).json({ character: result[0] });
  } catch (error) {
    console.error('Error updating character sharing:', error);
    res.status(500).json({ error: 'Failed to update character sharing' });
  }
}

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  switch (req.method) {
    case 'GET':
      return getCharacter(req, res);
    case 'PUT':
      // Check if this is a sharing update
      if (req.body && req.body.hasOwnProperty('isShared')) {
        return shareCharacter(req, res);
      }
      return updateCharacter(req, res);
    case 'DELETE':
      return deleteCharacter(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

module.exports = requireAuth(handler);