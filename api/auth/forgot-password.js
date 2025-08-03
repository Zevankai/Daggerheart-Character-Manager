const { getDb } = require('../lib/database.js');
const { generateToken } = require('../lib/auth.js');
const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');

async function sendPasswordResetEmail(email, username, resetUrl) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: 'Zevi Character Sheet <noreply@your-domain.com>', // You'll need to verify a domain or use resend's
    to: [email],
    subject: 'Reset Your Password - Zevi Character Sheet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        
        <p>Hi ${username},</p>
        
        <p>You requested to reset your password for your Zevi Character Sheet account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent from Zevi Character Sheet. If you have questions, please contact support.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

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
    
    // Send password reset email
    const resetUrl = `${req.headers.origin || 'https://your-app.vercel.app'}?reset=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.username, resetUrl);
      
      console.log(`Password reset email sent to: ${email}`);
      
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent to your email.' 
      });
      
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // In development, show the token if email fails
      const isDevelopment = process.env.VERCEL_ENV !== 'production';
      if (isDevelopment) {
        return res.status(200).json({ 
          message: 'Email service unavailable. Here is your reset link:',
          resetToken: resetToken,
          resetUrl: resetUrl
        });
      }
      
      // In production, still show success message for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};