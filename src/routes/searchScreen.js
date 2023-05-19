const { Router } = require("express");
const axios = require("axios");
const router = Router();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

router.get("/top-searches", async (req, res) => {
  await delay(1000);
  const results = await getTopSearches();
  return res.status(200).json({
    status: "success",
    endpoint: "topSearches",
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
      `${process.env.TMDB_BASE_URL}/trending/all/week?api_key=${process.env.TMDB_API_KEY}`
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
