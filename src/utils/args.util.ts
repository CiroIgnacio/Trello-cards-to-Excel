import readline from "readline";
import { CommandArgs } from "../types/trello.types";

export function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export async function askForParams(): Promise<CommandArgs> {
  const rl = createReadlineInterface();

  const board = await askQuestion(
    rl,
    "Nombre del tablero (Enter para traer todos): "
  );
  const fromDate = await askQuestion(
    rl,
    "Fecha desde (YYYYMMDD) (Enter para sin límite): "
  );
  const toDate = await askQuestion(
    rl,
    "Fecha hasta (YYYYMMDD) (Enter para sin límite): "
  );
  const labels = await askQuestion(
    rl,
    "Etiquetas (separadas por coma) (Enter para todas): "
  );
  const archived = await askQuestion(
    rl,
    "Incluir archivadas? (s/n/Enter para todas): "
  );

  rl.close();

  return {
    board: board || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    labels: labels ? labels.split(",").map((l) => l.trim()) : undefined,
    archived:
      archived.toLowerCase() === "s"
        ? true
        : archived.toLowerCase() === "n"
        ? false
        : undefined,
  };
}
