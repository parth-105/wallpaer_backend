import cron from "node-cron";
import { logInfo } from "../utils/logger.js";

export function startSchedulers(): void {
  cron.schedule("0 * * * *", () => {
    logInfo("Running hourly maintenance job (placeholder)");
  });
}
