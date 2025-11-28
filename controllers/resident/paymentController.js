const Payment = require('../../models/Payment');

exports.createPayment = async (req, res) => {
  try{ 

    const { amount, method } = req.body;

    const userId = req.user._id;
    const coomunityId = req.user.coomunityId;

    const payment = await Payment.create({
      amount,
      method,
      user: userId,
      community: communityId,
      status: "completed"
    });

    res.status(201).json({
      success: true,
      message: "Payment completed successfully",
      payment
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getPaymentHistory = async (req, res) => {

  try{

    const userId = req.user._id;

    const payments = await Payment.find({ user: userId}).sort({ transactionDate: -1});

    res.status(200).json({
      success: true,
      payments
    });

  }catch(error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}