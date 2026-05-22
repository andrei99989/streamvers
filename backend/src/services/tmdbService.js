import axios from 'axios';

const TMDB_IMAGE = 'https://image.tmdb.org/t/p';

function cleanTitle(value = '') {
  return String(value || '')
    .replace(/\b(trailer|official|teaser|clip|full movie|hd|4k|1080p|720p)\b/gi, ' ')
    .replace(/[|()[\]{}_:.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function posterUrl(path, size = 'w500') {
  return path ? `${TMDB_IMAGE}/${size}${path}` : '';
}

function backdropUrl(path, size = 'w1280') {
  return path ? `${TMDB_IMAGE}/${size}${path}` : '';
}

export async function enrichWithTmdb(title, category = 'custom') {
  const apiKey = process.env.TMDB_API_KEY;
  const query = cleanTitle(title);

  if (!apiKey || !query || query.length < 2) {
    return null;
  }

  const search = await axios.get('https://api.themoviedb.org/3/search/multi', {
    params: {
      api_key: apiKey,
      query,
      language: 'ro-RO',
      include_adult: false,
      page: 1,
    },
    timeout: 7000,
  });

  const results = Array.isArray(search.data?.results) ? search.data.results : [];
  const match = results.find((item) =>
    ['movie', 'tv'].includes(item.media_type) &&
    (item.poster_path || item.backdrop_path)
  ) || results.find((item) => ['movie', 'tv'].includes(item.media_type));

  if (!match) return null;

  const mediaType = match.media_type === 'tv' ? 'tv' : 'movie';
  const details = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${match.id}`, {
    params: {
      api_key: apiKey,
      language: 'ro-RO',
      append_to_response: 'credits,videos',
    },
    timeout: 7000,
  });

  const data = details.data || {};
  const videos = Array.isArray(data.videos?.results) ? data.videos.results : [];
  const trailer = videos.find((video) =>
    video.site === 'YouTube' &&
    ['Trailer', 'Teaser'].includes(video.type)
  );

  return {
    title: data.title || data.name || match.title || match.name || title,
    description: data.overview || match.overview || '',
    poster: posterUrl(data.poster_path || match.poster_path),
    backdrop: backdropUrl(data.backdrop_path || match.backdrop_path),
    type: mediaType,
    metadata: {
      tmdb: {
        id: data.id || match.id,
        mediaType,
        title: data.title || data.name || match.title || match.name || title,
        originalTitle: data.original_title || data.original_name || '',
        overview: data.overview || match.overview || '',
        posterPath: data.poster_path || match.poster_path || '',
        backdropPath: data.backdrop_path || match.backdrop_path || '',
        poster: posterUrl(data.poster_path || match.poster_path),
        backdrop: backdropUrl(data.backdrop_path || match.backdrop_path),
        releaseDate: data.release_date || data.first_air_date || '',
        year: String(data.release_date || data.first_air_date || '').slice(0, 4),
        rating: data.vote_average || 0,
        voteCount: data.vote_count || 0,
        genres: Array.isArray(data.genres) ? data.genres.map((g) => g.name) : [],
        runtime: data.runtime || (Array.isArray(data.episode_run_time) ? data.episode_run_time[0] : null),
        cast: Array.isArray(data.credits?.cast)
          ? data.credits.cast.slice(0, 10).map((person) => ({
              id: person.id,
              name: person.name,
              character: person.character,
              profile: posterUrl(person.profile_path, 'w185'),
            }))
          : [],
        trailer: trailer?.key ? `https://www.youtube.com/embed/${trailer.key}` : '',
      },
      enrichedAt: new Date().toISOString(),
    },
  };
}
