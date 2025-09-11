const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock authentication endpoints for development
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Mock successful login
  res.json({
    message: 'Login successful',
    user: {
      id: 1,
      email: email,
      username: email.split('@')[0]
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, username } = req.body;
  
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Mock successful registration
  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: Date.now(),
      email: email,
      username: username
    }
  });
});

// Mock health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Development server is running' });
});

// Mock characters endpoints
app.get('/api/characters', (req, res) => {
  res.json({ characters: [] });
});

app.post('/api/characters', (req, res) => {
  const { name, characterData } = req.body;
  res.json({
    character: {
      id: Date.now(),
      name: name || 'New Character',
      character_data: characterData || {},
      created_at: new Date().toISOString()
    }
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
  console.log('API endpoints available at http://localhost:' + PORT + '/api/*');
});