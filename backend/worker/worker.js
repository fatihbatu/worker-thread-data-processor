const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const Movie = require("../model/movie"); // Adjust the path as necessary

mongoose.connect("mongodb://localhost:27017/netflix");

const processMovies = async () => {
  try {
    const movies = JSON.parse(workerData.movies);
    const countryDurations = {};
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
        const durationMinutes = parseInt(duration.split(" ")[0], 10);
        countries.forEach((country) => {
          if (!isNaN(durationMinutes)) {
            countryDurations[country] =
              (countryDurations[country] || 0) + durationMinutes;
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          }
        });
      }
    });
    const countryAverages = {};

    countries.forEach((country) => {
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
