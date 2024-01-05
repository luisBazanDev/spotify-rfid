import SpotifyWebApi from "spotify-web-api-node";
import request from "request";
import { updateEnvValue } from "../utils/envUtils.js";
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
          resolve(this.refreshToken());
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
    return new Promise(async (resolve) => {
      const data = await this.spotifyApi.refreshAccessToken();
      if (!data.body.access_token) return resolve(false);
      updateEnvValue("USER_TOKEN", data.body.access_token);
      this.spotifyApi.setAccessToken(data.body.access_token);
      console.log("Token refresh");
      resolve(true);
    });
  }

  async getTokenFromCode(code) {
    return new Promise((resolve) => {
      const requestAuthOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
          Authorization:
            "Basic " +
            new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        form: {
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        },
        json: true,
      };

      request.post(requestAuthOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          resolve(body);
          return;
        }
        resolve(null);
      });
    });
  }
}

const spotifyService = new SpotifyService();

export default spotifyService;
