const { getDb } = require('../lib/database.js');
const { generateToken } = require('../lib/auth.js');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const sql = getDb();
    
    // Check if user exists
    const userResult = await sql`
      SELECT id, email, username
      FROM users
      WHERE email = ${email.toLowerCase()}
    `;
    
    if (userResult.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
    
    const user = userResult[0];
    
    // Generate reset token (expires in 1 hour)
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token in database
    await sql`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        token = ${resetToken},
        expires_at = ${expiresAt},
        created_at = CURRENT_TIMESTAMP
    `;
    
    // In a real app, you would send an email here
    // For now, we'll return the token in development
    const isDevelopment = process.env.VERCEL_ENV !== 'production';
    
    if (isDevelopment) {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      return res.status(200).json({ 
        message: 'Password reset token generated',
        resetToken: resetToken, // Only in development
        resetUrl: `${req.headers.origin || 'http://localhost:3000'}?reset=${resetToken}`
      });
    } else {
      // TODO: Send email with reset link
      // const resetUrl = `${req.headers.origin}/reset-password?token=${resetToken}`;
      // await sendPasswordResetEmail(user.email, resetUrl);
      
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};