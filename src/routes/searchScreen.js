const { Router } = require("express");
const axios = require("axios");
const router = Router();

router.get("/top-searches", async (req, res) => {
  const results = await getTopSearches();
  return res.status(200).json({
    status: "success",
    description: "top searches of the day",
    results: results,
  });
});

router.get("/top-results", async (req, res) => {
  // TODO => complete endpoint
});

async function getTopSearches() {
  try {
    let response = await axios.get(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.THEMOVIEDB_API_KEY}`
    );

    let results = response.data.results;
    results = results.filter((result) => result.media_type !== "person");
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { SearchScreen: router };
