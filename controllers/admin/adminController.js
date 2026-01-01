const Donation = require('../../models/Donation');
const { User } = require('../../models/User.model');

// @desc    Get all donations (Admin only)
// @route   GET /api/admin/donations
exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate('donor', 'name email')
            .populate('campaign', 'title')
            .sort('-date');

        res.status(200).json({ success: true, data: donations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin statistics
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
    try {
        const donations = await Donation.find();

        const totalDonations = donations.reduce((acc, curr) => acc + curr.amount, 0);
        const pendingReviews = donations.filter(d => d.status === 'Pending').length;

        const donorCount = await User.countDocuments({ role: 'user' });

        const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;

        res.status(200).json({
            success: true,
            data: {
                totalDonations,
                pendingReviews,
                totalDonors: donorCount,
                avgDonation
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update donation status
// @route   PUT /api/admin/donations/:id/status
exports.updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Verified', 'Flagged'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
