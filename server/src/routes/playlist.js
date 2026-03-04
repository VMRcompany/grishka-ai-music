const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMusicToPlaylist,
  removeMusicFromPlaylist,
  searchPublicPlaylists
} = require('../controllers/playlistController');

// Поиск публичных плейлистов (не требует авторизации)
router.get('/search', searchPublicPlaylists);

// Защищённые маршруты
router.get('/', authMiddleware, getUserPlaylists);
router.post('/', authMiddleware, createPlaylist);
router.get('/:playlistId', authMiddleware, getPlaylistById);
router.put('/:playlistId', authMiddleware, updatePlaylist);
router.delete('/:playlistId', authMiddleware, deletePlaylist);

// Музыка в плейлисте
router.post('/:playlistId/musics', authMiddleware, addMusicToPlaylist);
router.delete('/:playlistId/musics/:musicId', authMiddleware, removeMusicFromPlaylist);

module.exports = router;
