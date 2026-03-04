const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getAllMusic,
  getMusicById,
  getUserMusic,
  uploadMusic,
  deleteMusic,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  getFavoritesCount,
  searchMusic,
  incrementPlays,
  addComment
} = require('../controllers/musicController');

// Публичные маршруты
router.get('/', getAllMusic);
router.get('/search', searchMusic);
router.get('/user/:userId', getUserMusic);
router.get('/:id', getMusicById);
router.get('/:musicId/favorites-count', getFavoritesCount);

// Защищённые маршруты
router.post('/', authMiddleware, upload.single('audioFile'), uploadMusic);
router.delete('/:id', authMiddleware, deleteMusic);

// Избранное
router.post('/:musicId/favorites', authMiddleware, addToFavorites);
router.delete('/:musicId/favorites', authMiddleware, removeFromFavorites);
router.get('/:musicId/is-favorite', authMiddleware, isFavorite);

// Просмотры
router.post('/:id/play', authMiddleware, incrementPlays);

// Комментарии
router.post('/:id/comments', authMiddleware, addComment);

module.exports = router;
