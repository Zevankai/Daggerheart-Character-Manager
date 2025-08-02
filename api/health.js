module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(200).json({
    status: 'OK',
    message: 'Zevi Character Sheet API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development'
  });
}