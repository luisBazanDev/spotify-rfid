import { Router } from "express";
import SpotifyService from "../services/SpotifyService.js";
import { SECRET_WORD } from "../config.js";
import Relation from "../models/relations.js";
import spotifyService from "../services/SpotifyService.js";

const router = Router();

// App routes
// Main route for the esp32
router.post("/read", async (req, res) => {
  // Valid request
  if (req.body.secret_word !== SECRET_WORD)
    return res.status(400).send("Error");
  if (!req.body.rfid) return res.status(400).send("Error");
  // Valid token
  if (!(await spotifyService.validToken()))
    return res.status(500).send("Error");
  // Place album
  const tag_id = req.body.rfid;
  let relation = await Relation.findOne({ rfid: tag_id });
  if (relation === null) {
    relation = new Relation({ rfid: tag_id });
    await relation.save();
  }
  const result = await spotifyService.readRelation(relation.type, relation.id);
  res.status(200).send("Success");
});

// Admin view
router.get("/admin", async (req, res) => {
  if (SpotifyService.profile == null) await spotifyService.validToken();
  if (req.query.secret_word === SECRET_WORD) {
    const items = await Relation.find();
    res.render("admin", { spotifyAcount: SpotifyService.profile, items });
  } else res.status(401).send("Unauthorized");
});

// Callback to Oauth 2.0
// https://developer.spotify.com/documentation/web-api/tutorials/code-flow
router.get("/callback", async (req, res) => {
  if (req.query.code) {
    const tokens = await SpotifyService.getTokenFromCode(req.query.code);
    res.json(tokens);
  } else {
    res.status(200).send("OK");
  }
});

export default router;
