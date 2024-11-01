import axios from "axios";
import {
  TrelloCard,
  TrelloMember,
  TrelloList,
  TrelloLabel,
} from "../types/trello.types";
import { DateTime } from "luxon";

export class TrelloApiService {
  private readonly baseUrl = "https://api.trello.com/1";

  constructor(
    private readonly apiKey: string,
    private readonly apiToken: string,
    private readonly apiSecret: string
  ) {}

  private async get<T>(
    url: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    try {
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          token: this.apiToken,
          secret: this.apiSecret,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  }

  async getAllCards(
    boardId: string,
    filters: {
      fromDate?: string;
      archived?: boolean;
    } = {},
    batchSize = 10000
  ): Promise<TrelloCard[]> {
    const url = `${this.baseUrl}/boards/${boardId}/cards`;
    const allCards: TrelloCard[] = [];
    let params: Record<string, any> = {
      limit: batchSize,
      filter:
        filters.archived === undefined
          ? "all"
          : filters.archived
          ? "closed"
          : "visible",
    };

    if (filters.fromDate) {
      const fromDate = DateTime.fromFormat(filters.fromDate, "yyyyMMdd")
        .startOf("day")
        .toISO();
      params.since = fromDate;
    }

    let totalProcessed = 0;
    while (true) {
      try {
        console.log("Fetching with params:", params);
        const cards = await this.get<TrelloCard[]>(url, params);
        if (!cards) {
          console.log("No se recibieron cards en esta llamada");
          break;
        }

        allCards.push(...cards);
        totalProcessed += cards.length;
        console.log(`Batch recibido: ${cards.length} cards`);

        if (cards.length < batchSize) {
          console.log("Batch incompleto, terminando paginación");
          break;
        }

        params.before = cards[cards.length - 1].id;
        console.log(`Próximo batch comenzará desde: ${params.before}`);
      } catch (error) {
        console.error("Error getting cards:", error);
        break;
      }
    }

    return allCards;
  }

  async getBoardMembers(boardId: string): Promise<TrelloMember[]> {
    return this.get<TrelloMember[]>(
      `${this.baseUrl}/boards/${boardId}/members`,
      { fields: "id,fullName" }
    );
  }

  async getBoardLists(boardId: string): Promise<TrelloList[]> {
    return this.get<TrelloList[]>(`${this.baseUrl}/boards/${boardId}/lists`, {
      fields: "id,name",
    });
  }

  async getBoardLabels(boardId: string): Promise<TrelloLabel[]> {
    return this.get<TrelloLabel[]>(`${this.baseUrl}/boards/${boardId}/labels`, {
      fields: "id,name",
    });
  }
}
