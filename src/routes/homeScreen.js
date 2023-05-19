const { Router } = require("express");
const axios = require("axios");
const router = Router();

router.get("/", async (req, res) => {
  //await delay(10000); // Wait 10 seconds, for testing purposes
  const results = [
    await getPopularMovies(),
    await getPopularShows(),
    await getTopRatedMovies(2017, 2023),
  ];
  return res.status(200).json({
    status: "success",
    endpoint: "homeScreen",
    results: results,
  });
});

async function getPopularMovies() {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/movie/popular?api_key=${process.env.TMDB_API_KEY}`
    );
    const data = response.data.results.map((result) => {
      return { ...result, content_type: "movie" };
    });
    return {
      list_name: "Popular Movies",
      results: data.slice(0, 40),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTopRatedMovies(startDate, endDate) {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/discover/movie?api_key=${process.env.TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=600&primary_release_date.gte=${startDate}-01-01&primary_release_date.lte=${endDate}-12-31&region=US`
    );
    const data = response.data.results.map((result) => {
      return { ...result, content_type: "movie" };
    });
    return {
      list_name: `Top Rated Movies between ${startDate} and ${endDate}`,
      results: data.slice(0, 40),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPopularShows() {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/tv/popular?api_key=${process.env.TMDB_API_KEY}`
    );

    const data = response.data.results.map((result) => {
      return { ...result, content_type: "tv" };
    });
    return {
      list_name: "Popular Shows",
      results: data.slice(0, 40),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { HomeScreen: router };
