module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(200).json({
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
};