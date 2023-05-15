const { Router } = require("express");
const axios = require("axios");
const router = Router();

router.get("/", async (req, res) => {
  const results = {
    popular_movies: await getPopularMovies(),
    popular_shows: await getPopularShows(),
    top_rated_recent: await getTopRatedMovies(2017, 2023),
  };
  return res.status(200).json({
    status: "success",
    results: results,
  });
});

async function getPopularMovies() {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.THEMOVIEDB_API_KEY}`
    );
    return {
      listName: "Popular Movies",
      results: response.data.results.slice(0, 30),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTopRatedMovies(startDate, endDate) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.THEMOVIEDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=600&primary_release_date.gte=${startDate}-01-01&primary_release_date.lte=${endDate}-12-31&region=US`
    );
    return {
      listName: `Top Rated Movies between ${startDate} and ${endDate}`,
      results: response.data.results.slice(0, 30),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPopularShows() {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.THEMOVIEDB_API_KEY}`
    );
    return {
      listName: "Popular Shows",
      results: response.data.results.slice(0, 30),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { HomeScreen: router };
