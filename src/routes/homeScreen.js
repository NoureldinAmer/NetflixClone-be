const { Router } = require("express");
const axios = require("axios");
const router = Router();

router.get("/", async (req, res) => {
  //await delay(10000); // Wait 10 seconds, for testing purposes
  let results = [await getPopularMovies(), await getPopularShows()];

  const currentYear = new Date().getFullYear();

  let endYear = currentYear;
  let startYear = currentYear - 5;

  while (startYear >= 1980) {
    const movies = await getTopRatedMovies(startYear, endYear);
    const shows = await getTopRatedShows(startYear, endYear);
    results.push(movies);
    results.push(shows);
    endYear = startYear - 1;
    startYear -= 5;
  }

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
      return { ...result, media_type: "movie" };
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
      return { ...result, media_type: "movie" };
    });
    return {
      list_name: `Top Rated Movies (${startDate} - ${endDate})`,
      results: data.slice(0, 40),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTopRatedShows(startDate, endDate) {
  try {
    const response = await axios.get(
      `${process.env.TMDB_BASE_URL}/discover/tv?api_key=${process.env.TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=600&first_air_date.gte=${startDate}-01-01&first_air_date.lte=${endDate}-12-31&region=US`
    );
    const data = response.data.results.map((result) => {
      return { ...result, media_type: "tv" };
    });
    return {
      list_name: `Top Rated Shows (${startDate} - ${endDate})`,
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
      `${process.env.TMDB_BASE_URL}/trending/tv/day?api_key=${process.env.TMDB_API_KEY}`
    );

    const data = response.data.results.map((result) => {
      return { ...result, media_type: "tv" };
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
