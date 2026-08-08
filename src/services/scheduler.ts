import cron from "node-cron";
import { logInfo, logError } from "../utils/logger.js";
import { autoImportFromAPIs } from "./autoImportService.js";

export function startSchedulers(): void {
  // Hourly maintenance job
  cron.schedule("0 * * * *", () => {
    logInfo("Running hourly maintenance job (placeholder)");
  });

  // Daily auto-import from 3rd-party APIs at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    logInfo("Starting daily auto-import from 3rd-party APIs...");
    try {
      await autoImportFromAPIs({
        pexelsPhotos: 10,
        pexelsVideos: 5,
        pixabayPhotos: 10,
        pixabayVideos: 5,
        wallhavenPhotos: 10,
      });
      logInfo("Daily auto-import completed successfully");
    } catch (error) {
      logError("Daily auto-import failed", error);
    }
  });
}
