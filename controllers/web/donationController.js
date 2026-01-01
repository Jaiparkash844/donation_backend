const Donation = require('../../models/Donation');
const Campaign = require('../../models/Campaign');

// Create a Donation
exports.createDonation = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { amount, type, category, paymentMethod, campaignId } = req.body;

    // Validation
    if (!amount || !type || !category) {
      return res.status(400).json({ message: "Please provide amount, type, and category" });
    }

    // Optional: Check if campaign exists
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
    }

    // 1. Create the donation record
    const donation = await Donation.create({
      donor: req.user.id, // ID comes from the 'protect' middleware
      campaign: campaignId || null,
      amount,
      type,
      category,
      paymentMethod
    });

    // 2. If it's for a specific campaign, update that campaign's raisedAmount
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { raisedAmount: amount }
      });
    }

    res.status(201).json({ success: true, message: "Donation recorded successfully", data: donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's donations
exports.getMyDonations = async (req, res) => {
  try {
    console.log("Fetching donations for User ID:", req.user.id);
    const donations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title') // Shows the campaign name instead of just the ID
      .sort('-date');

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};