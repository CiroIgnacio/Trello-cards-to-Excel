import * as dotenv from "dotenv";
import { TrelloConfig } from "../types/trello.types";

dotenv.config();

export const config: TrelloConfig = {
  apiKey: process.env.TRELLO_API_KEY || "",
  apiToken: process.env.TRELLO_API_TOKEN || "",
  apiSecret: process.env.TRELLO_API_SECRET || "",
  boardIds: JSON.parse(process.env.TRELLO_BOARD_IDS || "{}"),
};
