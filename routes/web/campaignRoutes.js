const express = require('express');
const router = express.Router();
const { createCampaign, getCampaigns, getCampaignById, getCampaignStats, deleteCampaign } = require('../../controllers/web/campaignController');
const { protect, adminOnly } = require('../../middleware/auth.middle');

// Public route to view campaigns
router.get('/', getCampaigns);

// GET Global Stats (Total raised amount)
router.get('/stats', getCampaignStats);

// GET Single Campaign by ID
router.get('/:id', getCampaignById);

// Protected routes (Admin only)
router.post('/create', protect, adminOnly, createCampaign);
router.delete('/:id', protect, adminOnly, deleteCampaign);

module.exports = router;