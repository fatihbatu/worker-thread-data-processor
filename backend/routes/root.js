const express = require("express");
const router = express.Router();
const { Worker, isMainThread } = require("worker_threads");
const path = require("path");
const Movie = require("../model/movie");

router.post("/", async function (req, res, next) {
  try {
    const moviesData = await Movie.find({
      type: "Movie",
      duration: { $ne: null },
      country: { $ne: null },
    });

    // generate chunks of data to be processed by workers
    const numWorkers = 1;
    const chunkSize = Math.ceil(moviesData.length / numWorkers);
    const chunks = [];
    for (let i = 0; i < moviesData.length; i += chunkSize) {
      chunks.push(moviesData.slice(i, i + chunkSize));
    }

    if (isMainThread) {
      const workers = [];
      const countryAverages = {};
      let workersCompleted = 0;

      for (let i = 0; i < numWorkers; i++) {
        workers.push(
          new Worker(path.resolve(__dirname, "../worker.js"), {
            workerData: { movies: JSON.stringify(chunks[i]) },
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
