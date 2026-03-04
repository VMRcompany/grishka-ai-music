const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  musics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music'
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
playlistSchema.index({ user: 1 });
playlistSchema.index({ user: 1, name: 1 });
playlistSchema.index({ isPublic: 1, name: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);
