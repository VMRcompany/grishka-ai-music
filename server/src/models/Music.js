const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioFile: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  cover: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    default: 'Other'
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isProcessing: {
    type: Boolean,
    default: true
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
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
musicSchema.index({ createdAt: -1 });
musicSchema.index({ uploader: 1 });
musicSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Music', musicSchema);
