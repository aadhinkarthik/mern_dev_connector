const express = require('express');
const { connectDB } = require('./config/db');

const app = express();

// Establish Database Connection
connectDB();

// Initialize middleware
// @OMG! no need to use 'extended' T/F while using bodyparser
app.use(express.json()); 

// Test API
app.get('/', (req, res) => res.send('API is started & running'));

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/user', require('./routes/api/user'));

// Look for env variable called port, while deploying in Heroku
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));