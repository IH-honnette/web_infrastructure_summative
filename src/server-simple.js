const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "https://cdn.ipwhois.io"],
      connectSrc: ["'self'", "https://api.ipify.org", "https://ipwho.is"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for search history
let searchHistory = [];

// API Routes
app.get('/api/ip/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({ 
        error: 'Invalid IP address format',
        message: 'Please provide a valid IPv4 address'
      });
    }

    // Get IP information from ipwho.is
    const response = await axios.get(`https://ipwho.is/${ipAddress}`);
    
    if (!response.data.success) {
      return res.status(400).json({
        error: 'IP lookup failed',
        message: 'Could not retrieve information for this IP address'
      });
    }

    const ipData = response.data;
    
    // Add to search history
    const searchRecord = {
      id: Date.now(),
      ip: ipAddress,
      timestamp: new Date().toISOString(),
      result: ipData
    };
    searchHistory.unshift(searchRecord);
    
    // Keep only last 50 searches
    if (searchHistory.length > 50) {
      searchHistory = searchHistory.slice(0, 50);
    }

    res.json({
      success: true,
      data: ipData,
      searchId: searchRecord.id
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch IP information. Please try again.'
    });
  }
});

app.get('/api/my-ip', async (req, res) => {
  try {
    // First get the client's IP from ipify.org
    const ipifyResponse = await axios.get('https://api.ipify.org?format=json');
    const clientIP = ipifyResponse.data.ip;
    
    // Then get detailed information from ipwho.is
    const whoisResponse = await axios.get(`https://ipwho.is/${clientIP}`);
    
    if (!whoisResponse.data.success) {
      return res.status(400).json({
        error: 'IP lookup failed',
        message: 'Could not retrieve information for your IP address'
      });
    }

    const ipData = whoisResponse.data;
    
    res.json({
      success: true,
      data: ipData,
      clientIP: clientIP
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch your IP information.'
    });
  }
});

app.get('/api/history', (req, res) => {
  const { limit = 10, filter } = req.query;
  
  let filteredHistory = searchHistory;
  
  // Apply filters if specified
  if (filter) {
    const filters = filter.split(',');
    filteredHistory = searchHistory.filter(record => {
      const security = record.result.security;
      return filters.some(f => {
        switch(f.trim()) {
          case 'proxy': return security?.proxy;
          case 'vpn': return security?.vpn;
          case 'tor': return security?.tor;
          case 'safe': return !security?.proxy && !security?.vpn && !security?.tor;
          default: return true;
        }
      });
    });
  }
  
  res.json({
    success: true,
    data: filteredHistory.slice(0, parseInt(limit)),
    total: filteredHistory.length
  });
});

app.get('/api/stats', (req, res) => {
  const totalSearches = searchHistory.length;
  const proxyCount = searchHistory.filter(r => r.result.security?.proxy).length;
  const vpnCount = searchHistory.filter(r => r.result.security?.vpn).length;
  const torCount = searchHistory.filter(r => r.result.security?.tor).length;
  const safeCount = totalSearches - proxyCount - vpnCount - torCount;
  
  res.json({
    success: true,
    data: {
      totalSearches,
      proxyCount,
      vpnCount,
      torCount,
      safeCount,
      proxyPercentage: totalSearches > 0 ? ((proxyCount / totalSearches) * 100).toFixed(1) : 0,
      vpnPercentage: totalSearches > 0 ? ((vpnCount / totalSearches) * 100).toFixed(1) : 0,
      torPercentage: totalSearches > 0 ? ((torCount / totalSearches) * 100).toFixed(1) : 0,
      safePercentage: totalSearches > 0 ? ((safeCount / totalSearches) * 100).toFixed(1) : 0
    }
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IP Privacy Checker server running on port ${PORT}`);
  console.log(`📱 Access the application at: http://localhost:${PORT}`);
  console.log(`🔍 API endpoints available at: http://localhost:${PORT}/api/`);
  console.log(`🌐 Using free APIs: ipify.org and ipwho.is`);
}); 