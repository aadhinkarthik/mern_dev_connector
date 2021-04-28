const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Establish DB connection
connectDB();

app.get('/', (req, res) => res.send('API is started & running'));

// Define Routes
app.use('/api/auth', require('./routes/api/auth.js'));
app.use('/api/posts', require('./routes/api/posts.js'));
app.use('/api/profile', require('./routes/api/profile.js'));
app.use('/api/users', require('./routes/api/users.js'));

// Look for env variable called port, while deploying in Heroku
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));