const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const amountDollars = paymentIntent.amount_received / 100;

    if (userId) {
      try {
        // Prevent duplicate processing using referenceId
        const existingTx = await prisma.transaction.findFirst({
          where: { referenceId: paymentIntent.id }
        });

        if (!existingTx) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true }
          });

          if (user && user.wallet) {
            await prisma.$transaction(async (tx) => {
              await tx.wallet.update({
                where: { id: user.wallet.id },
                data: { balance: { increment: amountDollars } }
              });

              await tx.transaction.create({
                data: {
                  walletId: user.wallet.id,
                  type: 'DEPOSIT',
                  amount: amountDollars,
                  referenceId: paymentIntent.id,
                  description: 'Stripe Deposit'
                }
              });
            });
            console.log(`Successfully credited ${amountDollars} to user ${userId}`);
          }
        }
      } catch (error) {
        console.error('Error processing webhook ledger update:', error);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
