import React, { useState, useEffect } from 'react';
import './App.css';
import MusicList from './components/MusicList';
import SearchResults from './components/SearchResults';
import PlaylistManager from './components/PlaylistManager';
import { useAuth, useMusic, useSocket, usePlaylist } from './hooks/useApi';

function App() {
  const { user } = useAuth();
  const { 
    music, 
    loading, 
    favorites, 
    fetchAllMusic, 
    toggleFavorite, 
    deleteMusic 
  const {
    playlists,
    loading: playlistLoading,
    fetchUserPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist
  } = usePlaylist();
  const socket = useSocket();
  
  const [isLoadingFavorite, setIsLoadingFavorite] = useState({});
  const [isLoadingDelete, setIsLoadingDelete] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentTab, setCurrentTab] = useState('music'); // 'music' or 'playlists'

  useEffect(() => {
    fetchAllMusic();
  }, [fetchAllMusic]);

  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
    }
  }, [user, fetchUserPlaylists]);

  // Инициализация плейлист "Избранное" при логине
  useEffect(() => {
    if (user && socket) {
      socket.emit('join-user', user.id);
    }

    return () => {
      if (user && socket) {
        socket.emit('leave-user', user.id);
      }
    };
  }, [user, socket]);

  // Слушение обновлений в реал-тайм
  useEffect(() => {
    if (!socket) return;

    socket.on('music-favorite-updated', (data) => {
      // Обновить количество в избранном
      // Это должно быть обработано через состояние
    });

    socket.on('music-deleted', (data) => {
      // Удалить музыку из списка
      fetchAllMusic();
    });

    socket.on('music-uploaded', (data) => {
      // Добавить новую музыку в список
      fetchAllMusic();
    });

    return () => {
      socket.off('music-favorite-updated');
      socket.off('music-deleted');
      socket.off('music-uploaded');
    };
  }, [socket, fetchAllMusic]);

  const handleToggleFavorite = async (musicId, isFavorited) => {
    try {
      setIsLoadingFavorite(prev => ({ ...prev, [musicId]: true }));
      await toggleFavorite(musicId, isFavorited);
      
      if (socket) {
        const music_item = music.find(m => m._id === musicId);
        socket.emit(
          isFavorited ? 'music-unfavorited' : 'music-favorited',
          {
            musicId,
            favoriteCount: music_item?.favoriteCount || 0
          }
        );
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingFavorite(prev => ({ ...prev, [musicId]: false }));
    }
  };

  const handleDeleteMusic = async (musicId) => {
    if (!window.confirm('Are you sure you want to delete this music?')) {
      return;
    }

    try {
      setIsLoadingDelete(prev => ({ ...prev, [musicId]: true }));
      await deleteMusic(musicId);
      
      if (socket) {
        socket.emit('music-deleted', { musicId });
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingDelete(prev => ({ ...prev, [musicId]: false }));
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🎵 Grishka Music</h1>
          <div className="header-search">
            <input
              type="text"
              placeholder="Search music or public playlists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(e.target.value.length > 0);
              }}
              onFocus={() => setShowSearch(searchQuery.length > 0)}
            />
            {showSearch && (
              <SearchResults 
                query={searchQuery} 
                onClose={() => setShowSearch(false)}
              />
            )}
          </div>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.username}!</span>
              <button onClick={() => {
                localStorage.removeItem('user');
                window.location.reload();
              }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <nav className="app-nav">
          <button
            className={`nav-btn ${currentTab === 'music' ? 'active' : ''}`}
            onClick={() => setCurrentTab('music')}
          >
            Music
          </button>
          <button
            className={`nav-btn ${currentTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setCurrentTab('playlists')}
          >
            Playlists
          </button>
        </nav>
      )}
      <main>
        {currentTab === 'music' ? (
          <MusicList
            music={music}
            loading={loading}
            currentUserId={user?.id}
            onToggleFavorite={handleToggleFavorite}
            onDeleteMusic={handleDeleteMusic}
            favorites={favorites}
            isLoadingFavorite={isLoadingFavorite}
            isLoadingDelete={isLoadingDelete}
          />
        ) : (
          <PlaylistManager
            playlists={playlists}
            onCreatePlaylist={createPlaylist}
            onUpdatePlaylist={updatePlaylist}
            onDeletePlaylist={deletePlaylist}
            loading={playlistLoading}
          />
        )}
      </main>
    </div>
  );
}

export default App;
