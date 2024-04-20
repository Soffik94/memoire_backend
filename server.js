const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/users', require('./routes/users'));
app.use('/records', require('./routes/records'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

