const axios = require("axios");

let genres = null;

const fetchGenres = async () => {
  const genreEndpoints = [
    `${process.env.TMDB_BASE_URL}/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`,
    `${process.env.TMDB_BASE_URL}/genre/tv/list?api_key=${process.env.TMDB_API_KEY}`,
  ];

  try {
    const responses = await Promise.all(
      genreEndpoints.map((endpoint) => axios.get(endpoint))
    );

    // Combine genres from both responses
    const combinedGenres = responses.flatMap(
      (response) => response.data.genres
    );

    // Create a map to eliminate duplicates
    const genreMap = new Map();

    combinedGenres.forEach((genre) => {
      if (!genreMap.has(genre.id)) {
        genreMap.set(genre.id, genre);
      }
    });

    // Convert the map back into an array
    genres = Array.from(genreMap.values());
  } catch (error) {
    console.error(`Failed to fetch genres: ${error.message}`);
  }
};

const getGenre = (genreID) => {
  if (genres === null) {
    throw new Error(
      "Genres not yet loaded. Ensure fetchGenres is called at startup."
    );
  }

  const genre = genres.find((genre) => genre.id == genreID);
  return genre ? genre.name : null;
};

module.exports = { fetchGenres, getGenre };
