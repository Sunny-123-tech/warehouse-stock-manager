const express = require('express');
const cors = require('cors');
const path = require('path');
const stockRoutes = require('./routes/stock');

const app = express();
const PORT = process.env.PORT || 3000; // ✅ FIXED

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/stock', stockRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});