const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: [4, "Authors name must be at least 4 characters"],
  },
  born: {
    type: Number,
  },
});

module.exports = mongoose.model("Author", schema);
