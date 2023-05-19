const { Router } = require("express");
const axios = require("axios");
const router = Router();
const { convertRuntime } = require("./../utils/convertRuntime");
const { delay } = require("../utils/delay");

router.get("/:mediaType/:id", async (req, res) => {
  //await delay(10000);

  const { mediaType, id } = req.params;
  const results = await getMediaDetails(mediaType, id);

  return res.status(200).json({
    status: "success",
    endpoint: "details",
    results,
  });
});

const getMediaDetails = (mediaType, id) => {
  switch (mediaType) {
    case "movie":
      return getMovieDetails(id);
    case "tv":
      return getTVDetails(id);
    default:
      return "invalid media type";
  }
};

const fetchData = async (endpoint) => {
  try {
    const response = await axios.get(endpoint);
    return { data: response.data };
  } catch (error) {
    throw error;
  }
};

async function getMovieDetails(id) {
  const MediaDetailsEndpoints = [
    `${process.env.TMDB_BASE_URL}/movie/${id}?api_key=${process.env.TMDB_API_KEY}`,
    `${process.env.TMDB_BASE_URL}/movie/${id}/release_dates?api_key=${process.env.TMDB_API_KEY}`,
    `${process.env.TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${process.env.TMDB_API_KEY}`,
  ];

  const results = await Promise.all(MediaDetailsEndpoints.map(fetchData));

  //destrcuturing is based on the promise order
  let [movieDetails, releaseDates, recommendations] = results;
  movieDetails.data.runtime = convertRuntime(movieDetails.data.runtime);
  movieDetails.data.year = movieDetails.data.release_date.split("-")[0];

  //extract movie certification
  let certification = releaseDates.data.results.filter(
    (result) => result.iso_3166_1 === "US"
  );
  certification =
    certification[0].release_dates[0].certification !== ""
      ? certification[0].release_dates[0].certification
      : certification[0].release_dates[1].certification;
  console.log(certification);

  return {
    movieDetails: movieDetails.data,
    certification,
    recommendations: recommendations.data.results.slice(0, 9),
  };
}

function getTVDetails(id) {}

module.exports = { MediaDetails: router };
