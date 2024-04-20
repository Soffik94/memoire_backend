const express = require('express');
const fs = require('fs');
const router = express.Router();
const recordsPath = './data/records.json';
const usersPath = './data/users.json';

function getUser(userId) {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    return users.find(user => user.userId === parseInt(userId));
}

//Create record
router.post('/', (req, res) => {
  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  const { userId, content } = req.body;
  const user = getUser(userId);

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  const currentDate = new Date().toISOString().split('T')[0];
  let counter = 1;
  const lastRecord = records.filter(record => record.userId === userId)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (lastRecord) {
    const lastDate = new Date(lastRecord.date).toISOString().split('T')[0];
    if (lastDate === currentDate) {
      counter = lastRecord.counter;
    } 
    const lastDatePlusOne = new Date(lastDate);
    lastDatePlusOne.setDate(lastDatePlusOne.getDate() + 1);
    
    if (lastDatePlusOne.toISOString().split('T')[0] === currentDate) {
      counter = lastRecord.counter + 1;
    } else {
      counter = 0;
    }
  }

  const newRecord = {
    id: records.length + 1,
    userId,
    content,
    date: currentDate,
    counter: counter
  };

  records.push(newRecord);
  fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.status(201).json(newRecord);
});

// Delete record
router.delete('/:id', async (req, res) => {
  const userId = req.body.userId; 
  const recordId = parseInt(req.params.id);

  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  const user = getUser(userId);
  const record = records.find(record => record.id === recordId);

  if (!record || (record.userId !== userId && !(user && user.isAdmin === true))) {
    res.status(404).send('Record not found or you do not have permission to delete this record.');
    return;
  }

  const recordIndex = records.indexOf(record);
  records.splice(recordIndex, 1); 
  fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.status(200).send('Deleted successfully.');
});

//Edit record
router.put('/:id', async (req, res) => {
  const userId = req.body.userId;  
  const recordId = parseInt(req.params.id);
  const { content } = req.body;  

  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  const user = getUser(userId);
  const record = records.find(record => record.id === recordId);

  if (!record || (record.userId !== userId && !(user && user.isAdmin === true))) {
    res.status(404).send('Record not found or you do not have permission to edit this record.');
    return;
  }

  record.content = content;
  fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2));
  res.status(200).json(record);
});

module.exports = router;

// Get all records for a specific user
router.get('/user/:userId/records', (req, res) => {
  const { userId } = req.params;
  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  const userRecords = records.filter(record => record.userId === parseInt(userId));

  if (userRecords.length === 0) {
      res.status(404).send('No records found for this user.');
      return;
  }

  res.status(200).json(userRecords);
});

// Get counter of the last record for a specific user
router.get('/user/:userId/last-record-counter', (req, res) => {
  const { userId } = req.params;
  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  const userRecords = records.filter(record => record.userId === parseInt(userId));

  if (userRecords.length === 0) {
      res.status(404).send('No records found for this user.');
      return;
  }

  const lastRecord = userRecords[userRecords.length - 1]; 
  res.status(200).json({ lastRecordCounter: lastRecord.counter });
});