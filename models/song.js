const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  idTrack: String,
  strTrack: String,
  strArtist: String,
  strAlbum: String,
  intDuration: String,
  strGenre: String,
  strTrackThumb: String,
});

module.exports = mongoose.model("Song", songSchema);