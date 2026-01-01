const express = require('express');
const router = express.Router();
const { getAllDonations, getAdminStats, updateDonationStatus } = require('../../controllers/admin/adminController');
const { protect, adminOnly } = require('../../middleware/auth.middle');

// All routes here are admin only
router.use(protect);
router.use(adminOnly);

router.get('/donations', getAllDonations);
router.get('/stats', getAdminStats);
router.put('/donations/:id/status', updateDonationStatus);

module.exports = router;
