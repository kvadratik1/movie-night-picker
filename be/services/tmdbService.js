const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const MAX_MOVIE_IMAGES = 6;

function getTmdbApiKey() {
  return process.env.TMDB_API_KEY || process.env.THEMDB_API_KEY;
}

function buildTmdbUrl(path, params = {}) {
  const url = new URL(`${TMDB_API_BASE_URL}${path}`);
  const apiKey = getTmdbApiKey();

  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function buildImageUrl(filePath, size) {
  return `${TMDB_IMAGE_BASE_URL}/${size}${filePath}`;
}

async function fetchTmdb(path, params) {
  const apiKey = getTmdbApiKey();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(buildTmdbUrl(path, params));

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  return response.json();
}

function mapMovieImages(images) {
  const posters = (images?.posters || []).slice(0, 2).map((image) => ({
    type: "poster",
    url: buildImageUrl(image.file_path, "w500"),
    alt: "Movie poster",
  }));

  const backdrops = (images?.backdrops || []).slice(0, 4).map((image) => ({
    type: "backdrop",
    url: buildImageUrl(image.file_path, "w780"),
    alt: "Movie backdrop",
  }));

  return [...posters, ...backdrops].slice(0, MAX_MOVIE_IMAGES);
}

function getReleaseYear(movie) {
  return movie.release_date?.slice(0, 4);
}

function selectBestMovieMatch(results = [], year) {
  if (!year) {
    return results[0];
  }

  return (
    results.find((movie) => getReleaseYear(movie) === String(year)) ||
    results[0]
  );
}

export async function getMovieMedia({ title, year }) {
  if (!title) {
    return { tmdbId: null, images: [] };
  }

  const searchResults = await fetchTmdb("/search/movie", {
    query: title,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  const movie = selectBestMovieMatch(searchResults?.results, year);

  if (!movie) {
    return { tmdbId: null, images: [] };
  }

  const images = await fetchTmdb(`/movie/${movie.id}/images`, {
    include_image_language: "en,null",
  });

  return {
    tmdbId: movie.id,
    images: mapMovieImages(images),
  };
}
