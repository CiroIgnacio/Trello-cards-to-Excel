import { DateTime } from "luxon";
import {
  ProcessedCard,
  TrelloCard,
  TrelloMember,
  TrelloList,
  TrelloLabel,
} from "../types/trello.types";
import { DateUtils } from "../utils/date.utils";

export class DataProcessorService {
  static processCards(
    cards: TrelloCard[],
    members: TrelloMember[],
    lists: TrelloList[],
    labels: TrelloLabel[],
    filters: {
      fromDate?: string;
      toDate?: string;
      labels?: string[];
      archived?: boolean;
    }
  ): ProcessedCard[] {
    console.log(`Cards antes de filtrar: ${cards.length}`);

    const filteredCards = cards.filter((card) => {
      const cardDate = DateUtils.getCreationDate(card.id);

      if (filters.fromDate) {
        const fromDate = DateTime.fromFormat(
          filters.fromDate,
          "yyyyMMdd"
        ).startOf("day");
        if (cardDate < fromDate.toJSDate()) return false;
      }

      if (filters.toDate) {
        const toDate = DateTime.fromFormat(filters.toDate, "yyyyMMdd").endOf(
          "day"
        );
        if (cardDate > toDate.toJSDate()) return false;
      }

      if (filters.archived !== undefined && card.closed !== filters.archived) {
        return false;
      }

      if (filters.labels && filters.labels.length > 0) {
        const cardLabels = card.idLabels
          .map((id) => labels.find((l) => l.id === id)?.name || "")
          .join(" ")
          .toLowerCase();

        return filters.labels.some((label) =>
          cardLabels.includes(label.toLowerCase())
        );
      }

      return true;
    });

    console.log(`Cards después de filtrar: ${filteredCards.length}`);
    if (filters.labels) {
      console.log(`Filtrando por labels: ${filters.labels.join(", ")}`);
    }

    const membersMap = new Map(members.map((m) => [m.id, m.fullName]));
    const listsMap = new Map(lists.map((l) => [l.id, l.name]));
    const labelsMap = new Map(labels.map((l) => [l.id, l.name]));

    const processedCards = filteredCards.map((card) => {
      const cardMembers = card.idMembers
        .map((id) => membersMap.get(id))
        .filter((name) => name)
        .join(" - ");

      const cardLabels = card.idLabels
        .map((id) => labelsMap.get(id))
        .filter((name) => name)
        .join(" - ");

      return {
        card_id: card.id,
        card_name: card.name,
        card_description: card.desc,
        shortUrl: card.shortUrl,
        creation_date: DateUtils.getCreationDate(card.id),
        completed_date: card.dueComplete
          ? DateUtils.formatCompletedDate(card.due)
          : null,
        members: cardMembers,
        list_name: listsMap.get(card.idList) || "",
        labels: cardLabels,
        is_archived: card.closed,
      };
    });

    const uniqueCards = this.removeDuplicates(processedCards);
    console.log(
      `Cantidad de tarjetas totales post-procesamiento: ${uniqueCards.length}`
    );

    return uniqueCards;
  }

  private static removeDuplicates(cards: ProcessedCard[]): ProcessedCard[] {
    const seen = new Set();
    return cards.filter((card) => {
      const key = `${card.card_id}-${card.list_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
