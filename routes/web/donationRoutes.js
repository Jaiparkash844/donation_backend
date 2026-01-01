const express = require('express');
const router = express.Router();
const { createDonation, getMyDonations } = require('../../controllers/web/donationController');
const { protect } = require('../../middleware/auth.middle');

// POST: Submit a donation
router.post('/submit', protect, createDonation);

// GET: View my donation history
router.get('/my-donations', protect, getMyDonations);

module.exports = router;