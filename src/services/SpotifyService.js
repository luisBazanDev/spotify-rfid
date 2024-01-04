import SpotifyWebApi from "spotify-web-api-node";
import {
  CLIENT_ID,
  CLIENT_SECRET,
  USER_TOKEN,
  USER_REFRESH_TOKEN,
  REDIRECT_URI,
} from "../config.js";

class SpotifyService {
  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      accessToken: USER_TOKEN,
      refreshToken: USER_REFRESH_TOKEN,
      redirectUri: REDIRECT_URI,
    });

    // Singleton pattern
    if (typeof SpotifyService.instance === "object") {
      return SpotifyService.instance;
    }

    SpotifyService.instance = this;
    return this;
  }

  /**
   * Valid credentials
   * @param {boolean} logger Log user in the console
   * @returns {boolean} True if the credentials are valid
   */
  async validToken(logger = false) {
    return new Promise((resolve) => {
      this.spotifyApi.getUser("peladillas25", (err, res) => {
        if (
          (err && err.body.error.message === "The access token expired") ||
          !res.body
        ) {
          resolve(refreshToken());
        } else {
          if (logger) {
            console.log("token validated");
            console.log(`${res.body.display_name}(${res.body.id})`);
          }
          resolve(true);
        }
      });
    });
  }

  /**
   * Method to refresh the token
   * @returns True if it was possible refresh the token.
   */
  async refreshToken() {
    return new Promise((resolve) => {
      this.spotifyApi
        .refreshAccessToken()
        .then((x) => {
          if (!x.body.access_token) return resolve(false);
          this.spotifyApi.setAccessToken(x.body.access_token);
          console.log("Token refresh");
          resolve(true);
        })
        .catch((err) => {
          console.error(err);
          resolve(false);
        });
    });
  }
}

const spotifyService = new SpotifyService();

export default spotifyService;
