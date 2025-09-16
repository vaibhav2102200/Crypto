const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 5000;

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://donvaibhav21:<StX7LTcANb9G5NxI>@cluster0.dmd7ds0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'CyrptopayDB';

let db = null;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// User routes
app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await db.collection('users').findOne({ uid });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('users').insertOne(userData);
    res.json({ ...userData, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = {
      ...req.body,
      updatedAt: new Date()
    };
    await db.collection('users').updateOne({ uid }, { $set: updates });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.put('/api/users/:uid/balance', async (req, res) => {
  try {
    const { uid } = req.params;
    const { currency, amount } = req.body;
    
    const updateField = currency === 'INR' ? 'inrBalance' : `cryptoBalances.${currency}`;
    
    await db.collection('users').updateOne(
      { uid },
      { 
        $inc: { [updateField]: amount },
        $set: { updatedAt: new Date() }
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// Transaction routes
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 50 } = req.query;
    
    const query = { userId };
    if (type) {
      query.type = type;
    }
    
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      timestamp: new Date()
    };
    const result = await db.collection('transactions').insertOne(transactionData);
    res.json({ ...transactionData, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB connected to ${DB_NAME}`);
  });
}

startServer().catch(console.error);
