const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Establish DB connection
connectDB();

app.get('/', (req, res) => res.send('API is started & running'));

// Look for env variable called port, while deploying in Heroku
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));