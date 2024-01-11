import { Schema, model } from "mongoose";
import { RELATION_TYPES } from "../config.js";

const Relation = new Schema({
  rfid: { type: String, required: true },
  type: {
    type: String,
    enum: RELATION_TYPES,
    default: "IDK",
  },
  id: { type: String, default: null },
});

export default model("Relation", Relation);
