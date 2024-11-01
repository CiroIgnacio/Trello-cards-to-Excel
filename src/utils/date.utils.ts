import { DateTime } from "luxon";

export class DateUtils {
  static getCreationDate(id: string): Date {
    const idTrim = parseInt(id.substring(0, 8), 16);
    const creationTime = DateTime.fromSeconds(idTrim)
      .setZone("UTC")
      .setZone("America/Argentina/Buenos_Aires")
      .toJSDate();
    return creationTime;
  }

  static formatCompletedDate(dueDate: string | null): Date | null {
    if (!dueDate) return null;
    return DateTime.fromISO(dueDate)
      .setZone("America/Argentina/Buenos_Aires")
      .toJSDate();
  }

  static formatDate(): string {
    return DateTime.now().toFormat("yyyyMMdd");
  }
}
