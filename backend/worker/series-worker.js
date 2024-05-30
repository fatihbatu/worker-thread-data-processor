const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const Movie = require("../model/movie"); // Adjust the path as necessary

const processSeries = async () => {
  try {
    const movies = JSON.parse(workerData.series);
    const countrySessions = {};
    const countryCounts = {};
    let countries;
    movies.forEach((movie) => {
      let { country, duration } = movie;
      if (country.includes(",")) {
        countries = country.split(", ");
      } else {
        countries = [country];
      }
      if (countries.length > 0 && duration) {
        const sessionCount = parseInt(duration.split(" ")[0], 10);
        countries.forEach((country) => {
          if (!isNaN(sessionCount)) {
            countrySessions[country] =
              (countrySessions[country] || 0) + sessionCount;
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          }
        });
      }
    });
    const countryAverages = {};

    countries.forEach((country) => {
      Object.keys(countrySessions).forEach((country) => {
        countryAverages[country] = {
          sum: countrySessions[country],
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

processSeries();
