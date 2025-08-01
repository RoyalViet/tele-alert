import * as cron from "node-cron";
import PikespeakMonitor from "./pikespeak.cron";

// Initialize the Pikespeak monitor
const pikespeakMonitor = new PikespeakMonitor();

/**
 * Schedule the Pikespeak SWAP transaction monitor
 * Runs every 2 minutes
 */
export const startPikespeakMonitor = () => {
  console.log("🚀 Starting Pikespeak SWAP monitor...");

  // Run every 2 minutes
  cron.schedule("*/2 * * * *", async () => {
    console.log("\n⏰ Running Pikespeak SWAP check...");
    await pikespeakMonitor.checkAndNotify();
  });

  // Also run immediately on startup
  setTimeout(async () => {
    console.log("\n🔍 Initial Pikespeak SWAP check...");
    try {
      await pikespeakMonitor.checkAndNotify();
      // Send startup success notification
      const startupMessage = `
🚀 <b>Pikespeak Monitor Started</b>

✅ <b>Status:</b> Monitor is now active and checking for SWAP transactions
⏰ <b>Schedule:</b> Every 2 minutes
🎯 <b>Target:</b> csp88.near account
🕐 <b>Started at:</b> ${new Date().toLocaleString("vi-VN")}

The system will notify you when new SWAP transactions are detected.
      `.trim();
      // await require("../services/telegram/telegramService").sendNotification(
      //   startupMessage
      // );
      console.log(startupMessage);
    } catch (error) {
      console.error("Error in initial check:", error);
    }
  }, 5000); // Wait 5 seconds after startup
};

/**
 * Start all cron jobs
 */
export const startAllCronJobs = () => {
  console.log("🌟 Starting all cron jobs...");
  startPikespeakMonitor();
};

// Auto-start if this file is run directly
if (require.main === module) {
  startAllCronJobs();
}
