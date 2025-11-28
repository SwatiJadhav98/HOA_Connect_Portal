const Poll = require('../../models/Poll');

// exports.createPoll = async (req, res) => {
//   try {
//     const { question, options } = req.body;
//     const poll = new Poll({
//       question,
//       options: options.map(o => ({ text: o })),
//       community: req.user.community,
//       user: req.user._id
//     });
//     await poll.save();
//     res.json(poll);
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating poll', error: err.message });
//   }
// };

exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = new Poll({
      question,
      options: options.map(o => ({ text: o })), // fixed
      community: req.user.community,
      user: req.user._id
    });
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: 'Error creating poll', error: err.message });
  }
};


exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ community: req.user.community }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching polls', error: err.message });
  }
};