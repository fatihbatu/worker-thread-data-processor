const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    show_id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    director: String,
    cast: [String],
    country: String,
    date_added: String,
    release_year: String,
    rating: String,
    duration: String,
    listed_in: String,
    description: String,
  },
  {
    id: false,
    versionKey: false,
    timestamps: true,
  }
);

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
