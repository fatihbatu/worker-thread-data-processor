const express = require("express");
const router = express.Router();
const { Worker, isMainThread } = require("worker_threads");
const path = require("path");

router.post("/", async function (req, res, next) {
  try {
    if (isMainThread) {
      const numWorkers = 3;
      const workers = [];
      const countryAverages = {};
      let workersCompleted = 0;

      for (let i = 0; i < numWorkers; i++) {
        workers.push(
          new Worker(path.resolve(__dirname, "../worker.js"), {
            workerData: { start: i, numWorkers },
          })
        );
      }

      workers.forEach((worker) => {
        worker.on("message", (message) => {
          console.log(
            `Worker ${worker.threadId} finished with message:`,
            message
          );
          Object.entries(message).forEach(([country, avgDuration]) => {
            if (countryAverages[country]) {
              countryAverages[country].sum += avgDuration.sum;
              countryAverages[country].count += avgDuration.count;
            } else {
              countryAverages[country] = {
                sum: avgDuration.sum,
                count: avgDuration.count,
              };
            }
          });
          workersCompleted++;
          if (workersCompleted === numWorkers) {
            const finalAverages = {};
            Object.entries(countryAverages).forEach(
              ([country, { sum, count }]) => {
                finalAverages[country] = Math.floor(sum / count);
              }
            );
            res.json(finalAverages);
          }
        });
        worker.on("error", (error) => {
          console.error(`Worker ${worker.threadId} error:`, error);
        });
        worker.on("exit", () => {
          console.log(`Worker ${worker.threadId} exited`);
        });
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
