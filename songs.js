// fetchCharts.js
const Song = require("./models/song");

const CHARTS = [
  // Hindi
  { id: "137528343", name: "Top Hindi Songs" },
  { id: "138718473", name: "Top 20 Hindi" },
  { id: "16118637",  name: "Raagamaarg Hindi" },

  // Punjabi
  { id: "137528347", name: "Top Punjabi Songs" },
  { id: "138718474", name: "Top 20 Punjabi" },

  // English
  { id: "137528348", name: "Top English Songs" },
  { id: "138718475", name: "Top 20 English" },

  // Tamil, Telugu, etc.
  { id: "137528349", name: "Top Tamil Songs" },
  { id: "137528350", name: "Top Telugu Songs" },
  { id: "137528351", name: "Top Malayalam Songs" },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchChart(playlistId) {
  const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&listid=${playlistId}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch chart ${playlistId}: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.list || [];
}

async function fetchAllCharts() {
  console.log("Fetching songs from JioSaavn Charts...");

  let totalSaved = 0;

  for (const chart of CHARTS) {
    console.log(`\nFetching: ${chart.name} (ID: ${chart.id})`);

    const tracks = await fetchChart(chart.id);

    if (!tracks || tracks.length === 0) {
      console.log(`  No songs in ${chart.name}`);
      continue;
    }

    // Deduplicate by ID
    const unique = {};
    for (const t of tracks) {
      if (t.id) unique[t.id] = t;
    }
    const deduped = Object.values(unique);

    // Check DB
    const ids = deduped.map(t => t.id);
    const existing = await Song.find({ idTrack: { $in: ids } });
    const existingIds = new Set(existing.map(s => s.idTrack));

    const newTracks = deduped.filter(t => !existingIds.has(t.id));

    if (newTracks.length > 0) {
      const toInsert = newTracks.map(t => ({
        idTrack: t.id,
        strTrack: t.title,
        strArtist: t.more_info?.primary_artists || t.subtitle || "Unknown",
        strAlbum: t.album || "Unknown",
        intDuration: t.more_info?.duration ? Math.floor(t.more_info.duration) : null,
        strGenre: t.more_info?.language || "Unknown",
        strTrackThumb: t.image?.replace("50x50", "150x150") || null,
      }));

      await Song.insertMany(toInsert);
      totalSaved += toInsert.length;
      console.log(`  Saved ${toInsert.length} new songs from ${chart.name}`);
    } else {
      console.log(`  All songs from ${chart.name} already exist.`);
    }

    await delay(600); // Respect rate limits
  }

  console.log(`\nDONE! Total new songs from charts: ${totalSaved}`);
}

// Export + auto-run
module.exports = fetchAllCharts;

if (require.main === module) {
  fetchAllCharts().catch(console.error);
}