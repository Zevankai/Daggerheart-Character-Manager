const { authenticateUser } = require('../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await authenticateUser(email.toLowerCase(), password);
    
    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}