const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const Movie = require("./model/movie"); // Adjust the path as necessary

mongoose.connect("mongodb://localhost:27017/netflix");

const processMovies = async () => {
  try {
    const movies = await Movie.find({
      type: "Movie",
      duration: { $ne: null },
      country: { $ne: null },
    });
    const countryDurations = {};
    const countryCounts = {};
    let countryData;
    for (
      let i = workerData.start;
      i < movies.length;
      i += workerData.numWorkers
    ) {
      let { country, duration } = movies[i];
      if (country.includes(",")) {
        countryData = country.split(", ");
      } else {
        countryData = [country];
      }
      if (countryData.length > 0 && duration) {
        const durationMinutes = parseInt(duration.split(" ")[0], 10);
        countryData.forEach((country) => {
          if (!isNaN(durationMinutes)) {
            countryDurations[country] =
              (countryDurations[country] || 0) + durationMinutes;
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          }
        });
      }
    }
    const countryAverages = {};

    countryData.forEach((country) => {
      Object.keys(countryDurations).forEach((country) => {
        countryAverages[country] = {
          sum: countryDurations[country],
          count: countryCounts[country],
        };
      });
    });

    parentPort.postMessage(countryAverages);
    mongoose.connection.close();
  } catch (error) {
    parentPort.postMessage(`Error: ${error.message}`);
    mongoose.connection.close();
  }
};

processMovies();
