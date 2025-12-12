const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    color: { type: String, default: "" },
    nrOfEdits: { type: Number, default: 0 }
  },
  { timestamps: true, collection: "Notes", autoCreate: true }
);

module.exports = mongoose.model("Note", NoteSchema);
