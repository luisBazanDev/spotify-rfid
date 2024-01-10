import express from "express";
import { MONGO_URI, PORT } from "./config.js";
import SpotifyService from "./services/SpotifyService.js";
import Router from "./routes/Router.js";
import { connect as connectMongo } from "mongoose";

// Http server
const app = express();

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use("/", Router);

// Connect to the database
connectMongo(MONGO_URI, {}).then(() => {
  console.log("Database is ready");
});

// App listen
app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});

// Valid spotify token
SpotifyService.validToken(true);
