const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mydb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/items', require('./routes/items'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
