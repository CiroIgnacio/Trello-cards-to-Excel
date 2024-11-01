import * as XLSX from "xlsx";
import { ProcessedCard } from "../types/trello.types";

export class ExcelService {
  private static inMemoryData: ProcessedCard[] = []; 

  static async appendToExcel(
    data: ProcessedCard[],
    filePath: string,
    sheetName: string
  ): Promise<void> {
    try {
      this.inMemoryData.push(...data);

      const sortedData = this.inMemoryData.sort((a, b) => {
        const dateA = new Date(a.creation_date);
        const dateB = new Date(b.creation_date);
        return dateB.getTime() - dateA.getTime();
      });

      const workbook = XLSX.utils.book_new();

      const worksheet = XLSX.utils.json_to_sheet(sortedData, {
        dateNF: "yyyy-mm-dd hh:mm:ss",
      });

      const dateColumns = ["creation_date", "completed_date"];
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      for (let col = range.s.c; col <= range.e.c; col++) {
        const columnHeader = XLSX.utils.encode_col(col) + "1";
        const headerValue = worksheet[columnHeader]?.v;

        if (dateColumns.includes(headerValue)) {
          for (let row = 2; row <= range.e.r + 1; row++) {
            const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
            if (worksheet[cellRef]) {
              worksheet[cellRef].z = "yyyy-mm-dd hh:mm:ss";
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      XLSX.writeFile(workbook, filePath);
      console.log(`Archivo guardado: ${filePath} con ${this.inMemoryData.length} registros totales`);
    } catch (error) {
      console.error("Error saving Excel file:", error);
      throw error;
    }
  }

  static resetData(): void {
    this.inMemoryData = [];
  }
}