const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./database.js');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function createUser(email, password, username) {
  const sql = getDb();
  
  try {
    const passwordHash = await hashPassword(password);
    
    const result = await sql`
      INSERT INTO users (email, password_hash, username)
      VALUES (${email}, ${passwordHash}, ${username})
      RETURNING id, email, username, created_at
    `;
    
    return result[0];
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      if (error.detail.includes('email')) {
        throw new Error('Email already exists');
      }
      if (error.detail.includes('username')) {
        throw new Error('Username already exists');
      }
    }
    throw error;
  }
}

async function authenticateUser(email, password) {
  const sql = getDb();
  
  try {
    const result = await sql`
      SELECT id, email, username, password_hash
      FROM users
      WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = result[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    const token = generateToken(user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    };
  } catch (error) {
    throw error;
  }
}

async function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    const sql = getDb();
    const result = await sql`
      SELECT id, email, username, created_at
      FROM users
      WHERE id = ${decoded.userId}
    `;
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    return null;
  }
}

function requireAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createUser,
  authenticateUser,
  getUserFromToken,
  requireAuth
};