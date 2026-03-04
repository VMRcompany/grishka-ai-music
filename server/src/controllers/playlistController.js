const Playlist = require('../models/Playlist');
const Music = require('../models/Music');

// Получить плейлисты пользователя
const getUserPlaylists = async (req, res, next) => {
  try {
    const userId = req.userId;

    const playlists = await Playlist.find({ user: userId })
      .populate('musics')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// Поиск публичных плейлистов по названию
const searchPublicPlaylists = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    // простой текстовый поиск по названию и описанию
    const regex = new RegExp(q, 'i');

    const playlists = await Playlist.find({
      isPublic: true,
      $or: [{ name: regex }, { description: regex }]
    })
      .populate('user', 'username avatar')
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// Получить плейлист по ID
const getPlaylistById = async (req, res, next) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
      .populate({
        path: 'musics',
        populate: { path: 'uploader', select: 'username avatar' }
      })
      .populate('user', 'username avatar');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// Создать плейлист
const createPlaylist = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, description, isPublic } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = new Playlist({
      name,
      description,
      user: userId,
      isPublic: Boolean(isPublic)
    });

    await playlist.save();

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

// Обновить плейлист
const updatePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.user.toString() !== userId) {
      return res.status(403).json({ error: 'Only playlist owner can update it' });
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;
    if (typeof isPublic !== 'undefined') playlist.isPublic = Boolean(isPublic);

    await playlist.save();

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// Удалить плейлист
const deletePlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.user.toString() !== userId) {
      return res.status(403).json({ error: 'Only playlist owner can delete it' });
    }

    // Нельзя удалить плейлист "Избранное"
    if (playlist.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default playlist' });
    }

    await Playlist.deleteOne({ _id: playlistId });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Добавить музыку в плейлист
const addMusicToPlaylist = async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { musicId } = req.body;
    const userId = req.userId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.user.toString() !== userId) {
      return res.status(403).json({ error: 'Only playlist owner can add music' });
    }

    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    if (!playlist.musics.includes(musicId)) {
      playlist.musics.push(musicId);
      await playlist.save();
    }

    await playlist.populate({
      path: 'musics',
      populate: { path: 'uploader', select: 'username avatar' }
    });

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// Удалить музыку из плейлиста
const removeMusicFromPlaylist = async (req, res, next) => {
  try {
    const { playlistId, musicId } = req.params;
    const userId = req.userId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.user.toString() !== userId) {
      return res.status(403).json({ error: 'Only playlist owner can remove music' });
    }

    playlist.musics = playlist.musics.filter(id => id.toString() !== musicId);
    await playlist.save();

    await playlist.populate({
      path: 'musics',
      populate: { path: 'uploader', select: 'username avatar' }
    });

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMusicToPlaylist,
  removeMusicFromPlaylist,
  searchPublicPlaylists
};
