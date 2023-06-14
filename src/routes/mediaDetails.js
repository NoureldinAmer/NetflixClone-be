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
  movieDetails.data.duration = movieDetails.data.runtime;
  movieDetails.data.runtime = convertRuntime(movieDetails.data.runtime);
  movieDetails.data.year = movieDetails.data.release_date.split("-")[0];

  //extract movie certification
  let certification = releaseDates.data.results.filter(
    (result) => result.iso_3166_1 === "US"
  );
  certification = certification[0]?.release_dates[0]?.certification
    ? certification[0].release_dates[0].certification
    : "NA";
  console.log(certification);

  return {
    mediaDetails: movieDetails.data,
    certification,
    recommendations: recommendations.data.results.slice(0, 9),
  };
}

async function getTVDetails(id) {
  const MediaDetailsEndpoints = [
    `${process.env.TMDB_BASE_URL}/tv/${id}?api_key=${process.env.TMDB_API_KEY}`,
    `${process.env.TMDB_BASE_URL}/tv/${id}/content_ratings?api_key=${process.env.TMDB_API_KEY}`,
    `${process.env.TMDB_BASE_URL}/tv/${id}/recommendations?api_key=${process.env.TMDB_API_KEY}`,
  ];

  const results = await Promise.all(MediaDetailsEndpoints.map(fetchData));

  //destrcuturing is based on the promise order
  let [tvDetails, releaseDates, recommendations] = results;
  tvDetails.data.title = tvDetails.data.name;
  tvDetails.data.first_air_date = tvDetails.data.first_air_date.split("-")[0];

  //extract tv certification
  let certification = releaseDates.data.results.filter(
    (result) => result.iso_3166_1 === "US"
  );
  certification = certification[0] ? certification[0].rating : "NA";

  const promises = [];

  // TODO => some shows start with season 0
  for (let season = 1; season <= tvDetails.data.number_of_seasons; season++) {
    promises.push(
      axios.get(
        `${process.env.TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${process.env.TMDB_API_KEY}`
      )
    );
  }

  // Wait for all promises to resolve
  const responses = await Promise.all(promises);
  const today = new Date();

  // Map each response to its 'episodes' array and keep only certain properties
  let seasons = responses.map((response) => {
    const releaseDate = new Date(response.data.air_date);
    let season = {
      air_date: response.data.air_date,
      name: response.data.name,
      id: response.data.id,
      episodes: [],
      released: releaseDate > today ? false : true,
    };
    response.data.episodes.map((episode) =>
      season.episodes.push({
        name: episode.name,
        overview: episode.overview,
        runtime: episode.runtime,
        season_number: episode.season_number,
        episode_number: episode.episode_number,
        still_path: episode.still_path,
        air_date: episode.air_date,
      })
    );

    return season;
  });

  return {
    mediaDetails: tvDetails.data,
    certification,
    recommendations: recommendations.data.results.slice(0, 9),
    seasons,
  };
}

module.exports = { MediaDetails: router };
