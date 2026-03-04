const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('✓ User connected:', socket.id);

    // Присоединиться к комнате пользователя
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
    });

    // Покинуть комнату пользователя
    socket.on('leave-user', (userId) => {
      socket.leave(`user-${userId}`);
    });

    // Отправить уведомление о добавлении в избранное
    socket.on('music-favorited', (data) => {
      io.emit('music-favorite-updated', {
        musicId: data.musicId,
        favoriteCount: data.favoriteCount
      });
    });

    // Отправить уведомление об удалении из избранного
    socket.on('music-unfavorited', (data) => {
      io.emit('music-favorite-updated', {
        musicId: data.musicId,
        favoriteCount: data.favoriteCount
      });
    });

    // Отправить уведомление об удалении музыки
    socket.on('music-deleted', (data) => {
      io.emit('music-deleted', {
        musicId: data.musicId
      });
    });

    // Отправить уведомление об добавлении новой музыки
    socket.on('music-uploaded', (data) => {
      io.emit('music-uploaded', data);
    });

    socket.on('disconnect', () => {
      console.log('✗ User disconnected:', socket.id);
    });
  });
};

module.exports = { socketHandler };
