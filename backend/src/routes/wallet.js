const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get Wallet Balance & Transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const wallet = await req.prisma.wallet.findUnique({
      where: { userId: req.user.userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Stripe Payment Intent to Add Funds
router.post('/add-funds', authenticateToken, async (req, res) => {
  const { amount } = req.body; // amount in dollars

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.user.userId } });

    // In a real app, user should be KYC approved
    if (user.kycStatus !== 'APPROVED') {
      return res.status(403).json({ error: 'KYC not approved' });
    }

    let paymentIntent;
    
    // For demo purposes, if Stripe fails due to dummy keys, we fake a client secret
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        metadata: {
          userId: user.id
        }
      });
    } catch (stripeErr) {
      console.log('Stripe API error (using mock for demo):', stripeErr.message);
      paymentIntent = { client_secret: 'pi_mock_secret_' + Math.random().toString(36).substring(7) };
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock endpoint to simulate Stripe webhook success locally
router.post('/mock-deposit', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { wallet: true }
    });

    if (user && user.wallet) {
      await req.prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: { increment: amount } }
        });

        await tx.transaction.create({
          data: {
            walletId: user.wallet.id,
            type: 'DEPOSIT',
            amount: amount,
            referenceId: 'mock_' + Math.random().toString(36).substring(7),
            description: 'Demo Deposit (Mock)'
          }
        });
      });
      res.json({ message: 'Mock deposit successful' });
    } else {
      res.status(404).json({ error: 'User wallet not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer Funds to Another User
router.post('/transfer', authenticateToken, async (req, res) => {
  const { recipientEmail, amount } = req.body;

  if (!recipientEmail || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer details' });
  }

  try {
    const sender = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { wallet: true }
    });

    if (sender.wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const recipient = await req.prisma.user.findUnique({
      where: { email: recipientEmail },
      include: { wallet: true }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (sender.id === recipient.id) {
        return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    // Process Ledger Transfer (in a transaction)
    await req.prisma.$transaction(async (tx) => {
      // 1. Deduct from Sender
      await tx.wallet.update({
        where: { id: sender.wallet.id },
        data: { balance: { decrement: amount } }
      });
      await tx.transaction.create({
        data: {
          walletId: sender.wallet.id,
          type: 'TRANSFER_OUT',
          amount: amount,
          description: `Transfer to ${recipientEmail}`
        }
      });

      // 2. Add to Recipient
      await tx.wallet.update({
        where: { id: recipient.wallet.id },
        data: { balance: { increment: amount } }
      });
      await tx.transaction.create({
        data: {
          walletId: recipient.wallet.id,
          type: 'TRANSFER_IN',
          amount: amount,
          description: `Transfer from ${sender.email}`
        }
      });
    });

    res.json({ message: 'Transfer successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
