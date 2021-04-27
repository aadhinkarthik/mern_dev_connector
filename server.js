const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API is started & running'));

// Look for env variable called port, while deploying in Heroku
const PORT = process.env.PORT || 5555;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));