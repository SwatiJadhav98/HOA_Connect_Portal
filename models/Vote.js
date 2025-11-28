// const mongoose = require("mongoose");

// const pollOptionSchema = new mongoose.Schema({
//   optionText: { type: String, maxlength: 100 },
//   votes: { type: Number, default: 0 },
//   pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll" }
// });

// module.exports = mongoose.model("PollOption", pollOptionSchema);

const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  selectedOptionIndex: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Vote", voteSchema);