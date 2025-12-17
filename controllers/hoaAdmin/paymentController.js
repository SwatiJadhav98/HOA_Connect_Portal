const Payment = require('../../models/Payment');

exports.getPayments = async (req, res) => {
  try {
    console.log('✅ Logged-in User from protect middleware =>', req.user);

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!req.user.community) {
      return res.status(400).json({ message: "HOA Admin is not assigned to any community" });
    }
    const payments = await Payment.find({ community: req.user.community, status:"completed" }).populate('user', 'name email');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, community: req.user.community },
      req.body,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
};

exports.getPaymentsByDate = async (req, res) => {
  try {
    const communityId = req.user.community; // HOA Admin's community
    const { from, to } = req.query;

    // Build date filter
    let dateFilter = {};
    if (from && to) {
      dateFilter.transactionDate = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    } else if (from) {
      dateFilter.transactionDate = { $gte: new Date(from) };
    } else if (to) {
      dateFilter.transactionDate = { $lte: new Date(to) };
    }

    const payments = await Payment.find({
      community: communityId,
      ...dateFilter,
    })
      .populate("user", "name")
      .populate("community", "name")
      .sort({ date: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch payments",
      error: err.message,
    });
  }
};