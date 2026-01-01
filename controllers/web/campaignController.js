const Campaign = require('../../models/Campaign');

// @desc    Create a new campaign
// @route   POST /api/campaigns/create
// @access  Private/Admin
exports.createCampaign = async (req, res) => {
    try {
        const { title, description, goalAmount, deadline, defaultCategory } = req.body;

        const campaign = await Campaign.create({
            title,
            description,
            goalAmount,
            deadline,
            defaultCategory
        });

        res.status(201).json({ success: true, message: "Campaign created successfully", data: campaign });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }
        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global campaign stats (total raised)
// @route   GET /api/campaigns/stats
// @access  Public
exports.getCampaignStats = async (req, res) => {
    try {
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: "$raisedAmount" },
                    totalCampaigns: { $sum: 1 }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : { totalCollected: 0, totalCampaigns: 0 };
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private/Admin
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }
        res.status(200).json({ success: true, message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
