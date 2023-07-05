const { Router } = require("express");
const axios = require("axios");
const router = Router();

router.get("/", async (req, res) => {
  const upcomingMovies = await getUpComing();
  const newEpisodes = await getNewEpisodes();
  return res.status(200).json({
    status: "success",
    endpoint: "discover",
    //results: { upcoming_movies: upcomingMovies, new_episodes: newEpisodes },
  });
});

async function getUpComing() {
  try {
    // let response = await axios.get(
    //   `${process.env.TMDB_BASE_URL}/movie/upcoming?api_key=${process.env.TMDB_API_KEY}`
    // );

    // let results = response.data.results;
    // let today = new Date();
    // today.setHours(0, 0, 0, 0); // set time to 00:00:00

    // results = results.filter((result) => {
    //   let releaseDate = new Date(result.release_date);
    //   return releaseDate > today; // filters out dates less than today
    // });

    // results = results.sort((a, b) => {
    //   let dateA = new Date(a.release_date);
    //   let dateB = new Date(b.release_date);
    //   return dateA - dateB; // for descending order. Use dateA - dateB for ascending order
    // });

    console.log("results", results.release_date);

    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getNewEpisodes() {
  try {
    let response = await axios.get(
      `${process.env.TMDB_BASE_URL}/discover/tv?api_key=${process.env.TMDB_API_KEY}&air_date.gte=2023-05-01&vote_count.gte=3000&air_date.lte=2023-05-14`
    );

    let results = response.data.results;
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { DiscoverScreen: router };
