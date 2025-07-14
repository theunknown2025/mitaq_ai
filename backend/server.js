const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const tawtikRoutes = require('./routes/tawtikRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/tawtik', tawtikRoutes);

// Basic Hello World endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Hello World from the backend!' });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 