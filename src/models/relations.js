import { Schema, model } from "mongoose";

const Relation = new Schema({
  rfid: { type: String, required: true },
  type: {
    type: String,
    enum: ["ALBUM", "ARTIST", "SONG", "POTCAST", "IDK"],
    default: "IDK",
  },
  id: { type: String, default: null },
});

export default model("Relation", Relation);
