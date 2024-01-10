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
    this.profile = null;

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
          !res ||
          !res.body
        ) {
          resolve(this.refreshToken());
        } else {
          if (logger) {
            console.log("token validated");
            console.log(`${res.body.display_name}(${res.body.id})`);
          }
          this.profile = res.body;
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

  /**
   *
   * @param {string} type
   * @param {string} id
   * @returns {boolean}
   */
  async readRelation(type, id) {
    return new Promise(async (resolve) => {
      var baseUri = "spotify:";
      switch (type) {
        case "ALBUM":
          resolve(await this.play(baseUri + `album:${id}`));
          break;
        case "ARTIST":
          resolve(
            await this.play(null, {
              context_uri: baseUri + `artist:${id}`,
              offset: null,
            })
          );
          break;
        case "PLAYLIST":
          resolve(await this.play(baseUri + `playlist:${id}`));
          break;
        case "PODCAST":
          resolve(await this.play(baseUri + `show:${id}`));
          break;
        case "TRACK":
          const trackInformation = await this.getTrackInformation(id);
          if (trackInformation === null) return resolve(false);
          resolve(
            await this.play(null, {
              context_uri: trackInformation.album.uri,
              offset: { position: trackInformation.track_number - 1 },
            })
          );
          break;

        default:
          resolve(false);
          break;
      }
    });
  }

  /**
   * Play album in spotify
   * @param {string} spotifyUri Spotify Uri
   * @param {object} options Play options
   * @returns {boolean} True if playback started
   */
  async play(
    spotifyUri,
    options = {
      context_uri: spotifyUri,
      position_ms: 0,
      offset: { position: 0 },
    }
  ) {
    return new Promise((resolve) => {
      this.spotifyApi
        .play(options)
        .then((res) => {
          if (res.statusCode === 204) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log(options);
          console.error(err);
          resolve(false);
        });
    });
  }

  /**
   * Resolve track information or null
   * @param {string} id Track id
   * @returns {(SpotifyApi.SingleTrackResponse | null)}
   */
  async getTrackInformation(id) {
    return new Promise((resolve) => {
      this.spotifyApi
        .getTrack(id)
        .then((res) => {
          resolve(res?.body);
        })
        .catch((err) => {
          console.error(err);
          resolve(null);
        });
    });
  }
}

const spotifyService = new SpotifyService();

export default spotifyService;
