const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await req.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        wallet: {
          create: {
            balance: 0.0,
          }
        }
      }
    });

    res.json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'super-secret-jwt-key-for-demo', { expiresIn: '24h' });
    res.json({ token, userId: user.id, email: user.email, kycStatus: user.kycStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
