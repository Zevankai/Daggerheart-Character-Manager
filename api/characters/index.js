import { requireAuth } from '../lib/auth.js';
import { getDb } from '../lib/database.js';
import { v4 as uuidv4 } from 'uuid';

async function getCharacters(req, res) {
  try {
    const sql = getDb();
    const characters = await sql`
      SELECT id, name, character_data, is_shared, share_token, created_at, updated_at
      FROM characters
      WHERE user_id = ${req.user.id}
      ORDER BY updated_at DESC
    `;
    
    res.status(200).json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
}

async function createCharacter(req, res) {
  try {
    const sql = getDb();
    const { name, characterData = {} } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    const result = await sql`
      INSERT INTO characters (user_id, name, character_data)
      VALUES (${req.user.id}, ${name.trim()}, ${JSON.stringify(characterData)})
      RETURNING id, name, character_data, is_shared, share_token, created_at, updated_at
    `;
    
    res.status(201).json({ character: result[0] });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
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
      return createCharacter(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default requireAuth(handler);