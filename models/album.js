const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    idAlbum: {
      type: String,
      required: true,
      unique: true,
    },
    strAlbumMBID: { type: String },
    idArtist: { type: String },
    strArtistMBID: { type: String },
    strAlbum: { type: String, required: true },
    strArtist: { type: String, required: true },
    strCountry: { type: String, default: "us" },
    strGenre: { type: String }, 
    intChartPlace: { type: Number },
    strType: { type: String },    
    dateAdded: { type: Date },  
    strAlbumThumb: { type: String },
    strArtistThumb: { type: String },
    intYearReleased: { type: Number },
    intTrackCount: { type: Number },
    isTrending: { type: Boolean, default: true }, 
  },
  {
    timestamps: true, 
  }
);


albumSchema.index({ strArtist: 1, strAlbum: 1 }); 
albumSchema.index({ isTrending: 1, intChartPlace: 1 });
albumSchema.virtual("strAlbumThumbHD").get(function () {
  return this.strAlbumThumb?.replace(/150x150/, "500x500") || null;
});

module.exports = mongoose.model("Album", albumSchema);