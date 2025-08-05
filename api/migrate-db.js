const { requireAuth } = require('./lib/auth.js');
const { runMigration } = require('./migrate.js');

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Starting database migration via API...');
    await runMigration();
    
    res.status(200).json({
      status: 'success',
      message: 'Database migration completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database migration failed',
      error: error.message
    });
  }
};

module.exports = requireAuth(handler);