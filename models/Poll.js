// const mongoose = require("mongoose");

// const pollSchema = new mongoose.Schema({
//   question: { type: String, maxlength: 100 },
//   community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
//   options: [{ option: String, votes: { type: Number, default: 0 }}],
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// });

// module.exports = mongoose.model("Poll", pollSchema);

const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: { type: String, maxlength: 100, required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: { type: Number, default: 0 }
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who created
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);