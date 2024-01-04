import { Router } from "express";
import { SECRET_WORD } from "../config.js";
import Relation from "../models/relations.js";

const router = Router();

// App routes
// Main route for the esp32
router.post("/read", async (req, res) => {
  console.log(req.query);
  // Valid request
  if (req.query.secret_word !== SECRET_WORD)
    return res.status(400).send("Error");
  if (!req.query.rfid) return res.status(400).send("Error");
  // Valid token
  if (!(await validToken())) return res.status(500).send("Error");
  // Place album
  const tag_id = req.query.rfid;
  console.log(tag_id, await Relation.findOne({ rfid: tag_id }));
  res.status(200).send("Success");
});

// Admin view
router.get("/admin", async (req, res) => {
  if (req.query.secret_word === SECRET_WORD) {
    res.render("admin");
  } else res.status(401).send("Unauthorized");
});

export default router;
