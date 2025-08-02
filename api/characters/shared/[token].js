const { getDb } = require('../../lib/database.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = getDb();
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Share token is required' });
    }
    
    const result = await sql`
      SELECT c.id, c.name, c.character_data, c.created_at, c.updated_at, u.username as owner_username
      FROM characters c
      JOIN users u ON c.user_id = u.id
      WHERE c.share_token = ${token} AND c.is_shared = true
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Shared character not found or sharing disabled' });
    }
    
    const character = result[0];
    
    res.status(200).json({
      character: {
        id: character.id,
        name: character.name,
        character_data: character.character_data,
        owner_username: character.owner_username,
        created_at: character.created_at,
        updated_at: character.updated_at,
        is_shared: true
      }
    });
  } catch (error) {
    console.error('Error fetching shared character:', error);
    res.status(500).json({ error: 'Failed to fetch shared character' });
  }
}