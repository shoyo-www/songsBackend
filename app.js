const express = require('express');
const cors = require('cors');
const fetchAndStoreSongs = require("./songs");
const Song = require("./models/song");
const { fetchTrendingAlbums, fetchTopCharts, getAlbums } = require("./albums");
const PORT = 3000;
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ message: "Failed to fetch songs" });
  }
});

app.get("/test", (req, res) => {
  res.json({ hasGetSavedAlbums: typeof getAlbums === "function" });
});

app.get("/fetch-songs", async (req, res) => {
  const artist = req.query.artist || "Coldplay";
  try {
    await fetchAndStoreSongs(artist);
    res.send(`Success: Fetched songs for "${artist}"`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.get("/albums", async (req, res) => {
  try {
    const result = await fetchTrendingAlbums("us", "spotify");
    res.json({
      message: "Trending albums fetched successfully!",
      totalSaved: result.saved || 0,
      totalFetched: result.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/charts", async (req, res) => {
  try {
    const result = await fetchTopCharts("IN", "itunes");
    res.json({
      message: "Top charts fetched successfully!",
      totalSaved: result.saved || 0,
      totalFetched: result.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/albums", async (req, res) => {
  try {
    const result = await getAlbums({
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      isTrending: req.query.isTrending,
      search: req.query.search
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Hello, Express on Vercel!'));
app.get('/api/hello', (req, res) => res.json({
  message: 'Welcome to your Node.js + Express API'
}));
mongoose.connect("mongodb+srv://shoyostriker_db_user:VZClX6xJsLI9mGAz@mysongs.tekn7cb.mongodb.net/?appName=MySongs").then(()=> {
    console.log('conected');
});
app.listen(PORT,"0.0.0.0", (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
}
);