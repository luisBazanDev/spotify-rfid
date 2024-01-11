import { config as dotenv } from "dotenv";
dotenv();

export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const USER_TOKEN = process.env.USER_TOKEN;
export const USER_REFRESH_TOKEN = process.env.USER_REFRESH_TOKEN;
export const REDIRECT_URI = process.env.REDIRECT_URI;
export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const SECRET_WORD = process.env.SECRET_WORD;
export const RELATION_TYPES = ["ALBUM", "ARTIST", "SONG", "POTCAST", "IDK"];
