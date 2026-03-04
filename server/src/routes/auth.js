const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUserById,
  followUser,
  unfollowUser
} = require('../controllers/authController');

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.get('/user/:userId', getUserById);

// Защищённые маршруты
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/follow/:targetUserId', authMiddleware, followUser);
router.delete('/follow/:targetUserId', authMiddleware, unfollowUser);

module.exports = router;
