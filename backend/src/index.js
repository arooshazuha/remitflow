const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Webhook payload needs to be raw for Stripe signature verification
// So we use a separate route that doesn't use the standard json middleware
app.use('/api/webhook', express.raw({ type: 'application/json' }), require('./routes/webhook'));

// Normal routes use JSON body parsing
app.use(express.json());
app.use(cors());

// Pass prisma to requests (or just import in modules, but this is a simple demo)
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/kyc', require('./routes/kyc'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
