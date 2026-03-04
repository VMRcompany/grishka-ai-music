const Music = require('../models/Music');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const fs = require('fs');
const path = require('path');

// Получить все музыку
const getAllMusic = async (req, res, next) => {
  try {
    const music = await Music.find({ isProcessing: false })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(music);
  } catch (error) {
    next(error);
  }
};

// Получить музыку по ID
const getMusicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const music = await Music.findById(id)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');
    
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }
    
    res.json(music);
  } catch (error) {
    next(error);
  }
};

// Получить музыку пользователя
const getUserMusic = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const music = await Music.find({ uploader: userId })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(music);
  } catch (error) {
    next(error);
  }
};

// Загрузить музыку
const uploadMusic = async (req, res, next) => {
  try {
    const { title, artist, description, genre } = req.body;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const music = new Music({
      title,
      artist,
      description,
      genre,
      uploader: userId,
      audioFile: req.file.filename,
      fileSize: req.file.size,
      isProcessing: false
    });

    await music.save();
    await music.populate('uploader', 'username avatar');

    res.status(201).json(music);
  } catch (error) {
    next(error);
  }
};

// Удалить музыку (только автор)
const deleteMusic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const music = await Music.findById(id);
    
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    // Проверить, является ли пользователь автором
    if (music.uploader.toString() !== userId) {
      return res.status(403).json({ error: 'Only author can delete this music' });
    }

    // Удалить файл
    const filePath = path.join(__dirname, '../../uploads', music.audioFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удалить из всех плейлистов
    await Playlist.updateMany(
      {},
      { $pull: { musics: id } }
    );

    // Удалить музыку
    await Music.deleteOne({ _id: id });

    res.json({ message: 'Music deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Добавить в избранное
const addToFavorites = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.userId;

    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    const user = await User.findById(userId).populate('favoritePlaylist');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Если нет плейлиста "Избранное", создать его
    let favoritePlaylist = user.favoritePlaylist;
    if (!favoritePlaylist) {
      favoritePlaylist = new Playlist({
        name: 'Избранное',
        user: userId,
        isDefault: true
      });
      await favoritePlaylist.save();
      user.favoritePlaylist = favoritePlaylist._id;
      await user.save();
    }

    // Проверить, есть ли уже в плейлисте
    if (!favoritePlaylist.musics.includes(musicId)) {
      favoritePlaylist.musics.push(musicId);
      await favoritePlaylist.save();

      // Увеличить счетчик favoriteCount
      music.favoriteCount = (music.favoriteCount || 0) + 1;
      await music.save();
    }

    res.json({ message: 'Added to favorites', favoriteCount: music.favoriteCount });
  } catch (error) {
    next(error);
  }
};

// Удалить из избранного
const removeFromFavorites = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId).populate('favoritePlaylist');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favoritePlaylist = user.favoritePlaylist;
    if (!favoritePlaylist) {
      return res.status(404).json({ error: 'Favorite playlist not found' });
    }

    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    // Удалить из плейлиста
    if (favoritePlaylist.musics.includes(musicId)) {
      favoritePlaylist.musics = favoritePlaylist.musics.filter(
        id => id.toString() !== musicId
      );
      await favoritePlaylist.save();

      // Уменьшить счетчик favoriteCount
      music.favoriteCount = Math.max(0, (music.favoriteCount || 1) - 1);
      await music.save();
    }

    res.json({ message: 'Removed from favorites', favoriteCount: music.favoriteCount });
  } catch (error) {
    next(error);
  }
};

// Проверить, в избранном ли музыка
const isFavorite = async (req, res, next) => {
  try {
    const { musicId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId).populate('favoritePlaylist');
    if (!user || !user.favoritePlaylist) {
      return res.json({ isFavorite: false });
    }

    const isFav = user.favoritePlaylist.musics.includes(musicId);
    res.json({ isFavorite: isFav });
  } catch (error) {
    next(error);
  }
};

// Получить количество в избранном
const getFavoritesCount = async (req, res, next) => {
  try {
    const { musicId } = req.params;

    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    res.json({ favoriteCount: music.favoriteCount || 0 });
  } catch (error) {
    next(error);
  }
};

// Поиск музыки
const searchMusic = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const music = await Music.find(
      { $text: { $search: query }, isProcessing: false },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('uploader', 'username avatar');

    res.json(music);
  } catch (error) {
    next(error);
  }
};

// Увеличить счетчик plays
const incrementPlays = async (req, res, next) => {
  try {
    const { id } = req.params;

    const music = await Music.findByIdAndUpdate(
      id,
      { $inc: { plays: 1 } },
      { new: true }
    );

    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    res.json({ plays: music.plays });
  } catch (error) {
    next(error);
  }
};

// Добавить комментарий
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    const music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }

    music.comments.push({
      user: userId,
      text
    });

    await music.save();
    await music.populate('comments.user', 'username avatar');

    res.json(music);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
