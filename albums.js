// album.js
const Album = require("./models/album");

const API_KEY = "2";
const BASE_URL = `https://www.theaudiodb.com/api/v1/json/${API_KEY}`;
const COUNTRY = "us";
const TYPE = "itunes";
const FORMAT = "albums";

const DELAY_BETWEEN_REQUESTS = 600;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 1; i <= retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`Attempt ${i}/${retries} failed → ${e.message}`);
      if (i === retries) throw e;
      await delay(RETRY_DELAY * i);
    }
  }
}

async function fetchTrendingAlbums(country = COUNTRY, type = TYPE) {
  try {
    console.log(`Fetching trending albums – ${country} / ${type}`);

    const data = await fetchWithRetry(
      `${BASE_URL}/trending.php?country=${country}&type=${type}&format=${FORMAT}`
    );

    const albums = data?.trending ?? [];
    if (!albums.length) {
      console.log("No trending albums returned.");
      return { success: true, saved: 0, total: 0 };
    }

    const uniq = {};
    for (const a of albums) if (a.idAlbum) uniq[a.idAlbum] = a;
    const deduped = Object.values(uniq);

    const ids = deduped.map(a => a.idAlbum);
    const existing = await Album.find({ idAlbum: { $in: ids } });
    const existingIds = new Set(existing.map(a => a.idAlbum));

    const toSave = deduped.filter(a => !existingIds.has(a.idAlbum));
    if (!toSave.length) {
      console.log("All trending albums already in DB.");
      return { success: true, saved: 0, total: deduped.length };
    }

    const docs = toSave.map(a => ({
      idAlbum: a.idAlbum,
      strAlbumMBID: a.strAlbumMBID,
      idArtist: a.idArtist,
      strArtistMBID: a.strArtistMBID,

      strAlbum: a.strAlbum || "Unknown Album",
      strArtist: a.strArtist || "Unknown Artist",
      strCountry: a.strCountry || country,
      strGenre: "trending",

      intChartPlace: parseInt(a.intChartPlace) || null,
      strType: a.strType || type,
      intWeek: parseInt(a.intWeek) || null,
      dateAdded: a.dateAdded ? new Date(a.dateAdded) : new Date(),

      strAlbumThumb: a.strAlbumThumb,
      strArtistThumb: a.strArtistThumb,

      isTrending: true,
    }));

    const result = await Album.insertMany(docs);
    console.log(`Saved ${result.length} new trending albums.`);

    return {
      success: true,
      saved: result.length,
      total: deduped.length,
    };
  } catch (err) {
    console.error("fetchTrendingAlbums error:", err.message);
    return { success: false, error: err.message, saved: 0, total: 0 };
  }
}


async function getAlbums({
  page = 1,
  limit = 20,
  sortBy = "intChartPlace", 
  sortOrder = "asc",       
  isTrending = null,      
  search = ""              
} = {}) {
  try {
    const query = {};
    if (isTrending !== null) {
      query.isTrending = isTrending;
    }
    if (search) {
      query.$or = [
        { strAlbum: { $regex: search, $options: "i" } },
        { strArtist: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const albums = await Album.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); 

    const total = await Album.countDocuments(query);

    console.log(`Retrieved ${albums.length} albums (Page ${page}/${Math.ceil(total/limit)})`);

    return {
      success: true,
      data: {
        albums,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };

  } catch (err) {
    console.error("getSavedAlbums error:", err.message);
    return {
      success: false,
      error: err.message,
      data: null
    };
  }
}

async function fetchTopCharts(country = COUNTRY, type = TYPE, limit = 100) {
}

module.exports = {
  fetchTrendingAlbums,
  fetchTopCharts,  
  getAlbums
};