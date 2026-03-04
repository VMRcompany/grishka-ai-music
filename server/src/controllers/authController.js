const User = require('../models/User');
const Playlist = require('../models/Playlist');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Регистрация
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    // Создание пользователя
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Создание плейлиста "Избранное"
    const favoritePlaylist = new Playlist({
      name: 'Избранное',
      user: user._id,
      isDefault: true
    });

    await favoritePlaylist.save();

    // Обновление пользователя со ссылкой на плейлист
    user.favoritePlaylist = favoritePlaylist._id;
    await user.save();

    // Генерирование токена
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      userId: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Вход
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Получить профиль пользователя
const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId)
      .select('-password')
      .populate('favoritePlaylist');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Обновить профиль
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { username, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Получить пользователя по ID
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Подписаться на пользователя
const followUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.following.includes(targetUserId)) {
      user.following.push(targetUserId);
      targetUser.followers.push(userId);

      await user.save();
      await targetUser.save();
    }

    res.json({ message: 'Following user' });
  } catch (error) {
    next(error);
  }
};

// Отписаться от пользователя
const unfollowUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { targetUserId } = req.params;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.following = user.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    await user.save();
    await targetUser.save();

    res.json({ message: 'Unfollowed user' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUserById,
  followUser,
  unfollowUser
};
