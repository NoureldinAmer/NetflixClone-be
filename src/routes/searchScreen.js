const { Router } = require("express");
const axios = require("axios");
const { getGenre } = require("./../utils/getGenres");
const router = Router();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    console.log(query);

    if (!query) {
      return res.status(400).json({ error: "Search query is missing" });
    }

    const results = await getSearchQuery(query);

    return res.status(200).json({ results });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

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

async function getSearchQuery(query) {
  try {
    let response = await axios.get(
      `${process.env.TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(
        query
      )}&api_key=${process.env.TMDB_API_KEY}`
    );

    let topResults = response.data.results;

    const promises = [];
    const pageEnd =
      response.data.total_pages >= 7 ? 7 : response.data.total_pages;
    if (pageEnd >= 2) {
      for (let page = 2; page <= 5; page++) {
        promises.push(
          axios.get(
            `${
              process.env.TMDB_BASE_URL
            }/search/multi?query=${encodeURIComponent(query)}&api_key=${
              process.env.TMDB_API_KEY
            }&page=${page}`
          )
        );
      }
    }

    // Wait for all promises to resolve
    const responses = await Promise.all(promises);

    let genreIdCounts = {};
    // Loop over all responses
    for (let response of responses) {
      // Loop over results and count genre_ids
      for (let item of response.data.results) {
        if (item.genre_ids && Array.isArray(item.genre_ids)) {
          for (let genreId of item.genre_ids) {
            if (genreIdCounts[genreId]) {
              genreIdCounts[genreId].push(item);
            } else {
              genreIdCounts[genreId] = [item];
            }
          }
        }
      }
    }

    // Convert the object into an array of [key, value] pairs
    let genreIdPairs = Object.entries(genreIdCounts);

    // Sort the array by the length of the value arrays (in descending order)
    genreIdPairs.sort((a, b) => b[1].length - a[1].length);

    let results = genreIdPairs.map((pair) => ({
      genre_id: pair[0],
      genre_name: getGenre(pair[0]),
      content: pair[1],
    }));

    if (topResults.length) {
      results.unshift({
        genre_id: -1,
        genre_name: "Top Searches",
        content: topResults,
      });
    }

    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { SearchScreen: router };
