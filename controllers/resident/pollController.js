const Vote = require('../../models/Vote');
const Poll = require('../../models/Poll');

exports.votePoll = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionIndex } = req.body;

    // Check duplicate vote
    const existingVote = await Vote.findOne({ poll: pollId, resident: req.user._id });
    if (existingVote) {
      return res.status(400).json({ message: "You already voted in this poll" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.options[optionIndex].votes += 1;
    await poll.save();

    await Vote.create({
      poll: pollId,
      resident: req.user._id,
      selectedOptionIndex: optionIndex
    });

    res.json({ message: "Vote submitted successfully" });

  } catch (err) {
    res.status(500).json({ message: 'Error voting', error: err.message });
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