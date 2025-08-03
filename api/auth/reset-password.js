const { getDb } = require('../lib/database.js');
const { hashPassword } = require('../lib/auth.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    const sql = getDb();
    
    // Find valid reset token
    const tokenResult = await sql`
      SELECT pr.user_id, pr.expires_at, u.email
      FROM password_resets pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.token = ${token} AND pr.expires_at > CURRENT_TIMESTAMP
    `;
    
    if (tokenResult.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const { user_id, email } = tokenResult[0];
    
    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update user password
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user_id}
    `;
    
    // Delete used reset token
    await sql`
      DELETE FROM password_resets 
      WHERE user_id = ${user_id}
    `;
    
    console.log(`Password reset successful for user: ${email}`);
    
    res.status(200).json({ 
      message: 'Password reset successful. You can now log in with your new password.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};