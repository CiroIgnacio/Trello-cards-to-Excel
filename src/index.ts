import { TrelloApiService } from "./services/trello-api.service";
import { config } from "./config/config";
import { DateUtils } from "./utils/date.utils";
import path from "path";
import { DataProcessorService } from "./services/data-processor.service";
import { ExcelService } from "./services/excel.service";
import { askForParams } from "./utils/args.util";

async function main() {
  const trelloApi = new TrelloApiService(
    config.apiKey,
    config.apiToken,
    config.apiSecret
  );
  const today = DateUtils.formatDate();
  const args = await askForParams();

  const BATCH_SIZE = 20000;

  let boardsToProcess = config.boardIds;
  if (args.board) {
    boardsToProcess = Object.fromEntries(
      Object.entries(config.boardIds).filter(
        ([key]) => key.toLowerCase() === args.board?.toLowerCase()
      )
    );
  }

  const searchLabels = args.labels;
  for (const [key, boardId] of Object.entries(boardsToProcess)) {
    try {
      console.log(`\nProcesando tablero: ${key}`);
      const output_path = path.join(
        __dirname,
        "..",
        "data",
        `trello_${key}_${today}.xlsx`
      );

      console.log("Obteniendo cards...");
      const allCards = await trelloApi.getAllCards(boardId, {
        fromDate: args.fromDate,
        archived: args.archived,
      });

      if (!allCards || allCards.length === 0) {
        console.log(`No se pudieron obtener datos para el tablero ${key}`);
        continue;
      }

      const total_cards = allCards.length;
      console.log(`Total de cards obtenidas: ${total_cards}`);

      console.log("Obteniendo datos maestros...");
      const [members, lists, labels] = await Promise.all([
        trelloApi.getBoardMembers(boardId),
        trelloApi.getBoardLists(boardId),
        trelloApi.getBoardLabels(boardId),
      ]);

      const num_batches = Math.ceil(total_cards / BATCH_SIZE);
      console.log(
        `\nProcesando ${total_cards} cards en ${num_batches} lotes de ${BATCH_SIZE}`
      );

      for (let batch_num = 0; batch_num < num_batches; batch_num++) {
        const start_idx = batch_num * BATCH_SIZE;
        const end_idx = Math.min((batch_num + 1) * BATCH_SIZE, total_cards);

        console.log(
          `\nProcesando lote ${batch_num + 1}/${num_batches} (cards ${
            start_idx + 1
          } a ${end_idx})`
        );

        const cards_batch = allCards.slice(start_idx, end_idx);
        const processed_batch = DataProcessorService.processCards(
          cards_batch,
          members,
          lists,
          labels,
          {
            fromDate: args.fromDate,
            toDate: args.toDate,
            labels: searchLabels,
            archived: args.archived,
          }
        );

        await ExcelService.appendToExcel(processed_batch, output_path, "Cards");
        console.log(
          `Lote ${batch_num + 1} agregado al archivo: ${output_path}`
        );
      }

      console.log(`\nProcesamiento completo del tablero ${key}`);
      console.log(`Datos guardados en: ${output_path}`);
    } catch (error) {
      console.error(`Error processing board ${key}:`, error);
    } finally {
      ExcelService.resetData();
    }
  }
}

main().catch(console.error);
