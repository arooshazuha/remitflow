const express = require('express');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { fullName, idNumber, country } = req.body;

  if (!fullName || !idNumber || !country) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if KYC already exists
    const existingKyc = await req.prisma.kYCVerification.findUnique({
      where: { userId: req.user.userId }
    });

    if (existingKyc) {
      return res.status(400).json({ error: 'KYC already submitted' });
    }

    // Auto-approve for demo purposes
    const kyc = await req.prisma.kYCVerification.create({
      data: {
        userId: req.user.userId,
        fullName,
        idNumber,
        country,
        status: 'APPROVED' // Simulating quick approval
      }
    });

    // Update user status
    await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { kycStatus: 'APPROVED' }
    });

    res.json({ message: 'KYC Verification Approved', kyc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
