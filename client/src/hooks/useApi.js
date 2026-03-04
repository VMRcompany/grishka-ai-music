import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      });
      const userData = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        token: response.data.token
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      const userData = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        token: response.data.token
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return { user, loading, error, register, login, logout };
};

export const useMusic = () => {
  const { user } = useAuth();
  const [music, setMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});

  const getAuthHeaders = useCallback(() => {
    if (!user) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  const fetchAllMusic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/music`);
      setMusic(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch music');
    } finally {
      setLoading(false);
    }
  }, []);

  const isMusicFavorite = useCallback(async (musicId) => {
    if (!user) return false;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/music/${musicId}/is-favorite`,
        { headers: getAuthHeaders() }
      );
      return response.data.isFavorite;
    } catch {
      return false;
    }
  }, [user, getAuthHeaders]);

  const toggleFavorite = useCallback(async (musicId, currentlyFavorited) => {
    if (!user) throw new Error('Not authenticated');

    try {
      if (currentlyFavorited) {
        await axios.delete(
          `${API_BASE_URL}/music/${musicId}/favorites`,
          { headers: getAuthHeaders() }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/music/${musicId}/favorites`,
          {},
          { headers: getAuthHeaders() }
        );
      }

      setFavorites(prev => ({
        ...prev,
        [musicId]: !currentlyFavorited
      }));

      // Обновить favoriteCount в объекте музыки
      setMusic(prev => prev.map(m => {
        if (m._id === musicId) {
          return {
            ...m,
            favoriteCount: currentlyFavorited 
              ? (m.favoriteCount || 1) - 1 
              : (m.favoriteCount || 0) + 1
          };
        }
        return m;
      }));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to toggle favorite');
    }
  }, [user, getAuthHeaders]);

  const deleteMusic = useCallback(async (musicId) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await axios.delete(
        `${API_BASE_URL}/music/${musicId}`,
        { headers: getAuthHeaders() }
      );

      setMusic(prev => prev.filter(m => m._id !== musicId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete music');
    }
  }, [user, getAuthHeaders]);

  return {
    music,
    loading,
    error,
    favorites,
    fetchAllMusic,
    isMusicFavorite,
    toggleFavorite,
    deleteMusic
  };
};

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export const usePlaylist = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    if (!user) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user]);

  const fetchUserPlaylists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/playlists`,
        { headers: getAuthHeaders() }
      );
      setPlaylists(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const createPlaylist = useCallback(async (name, description = '', isPublic = false) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/playlists`,
        { name, description, isPublic },
        { headers: getAuthHeaders() }
      );
      setPlaylists(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create playlist');
    }
  }, [user, getAuthHeaders]);

  const updatePlaylist = useCallback(async (playlistId, name, description, isPublic) => {
    if (!user) throw new Error('Not authenticated');
    try {
      const response = await axios.put(
        `${API_BASE_URL}/playlists/${playlistId}`,
        { name, description, isPublic },
        { headers: getAuthHeaders() }
      );
      setPlaylists(prev => prev.map(p => p._id === playlistId ? response.data : p));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update playlist');
    }
  }, [user, getAuthHeaders]);

  const deletePlaylist = useCallback(async (playlistId) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await axios.delete(
        `${API_BASE_URL}/playlists/${playlistId}`,
        { headers: getAuthHeaders() }
      );
      setPlaylists(prev => prev.filter(p => p._id !== playlistId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete playlist');
    }
  }, [user, getAuthHeaders]);

  const searchPublicPlaylists = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      return [];
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/playlists/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (err) {
      console.error('Failed to search playlists:', err);
      return [];
    }
  }, []);

  return {
    playlists,
    loading,
    error,
    fetchUserPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    searchPublicPlaylists
  };
};

export const usePlaylistInitialization = () => {
  const { user } = useAuth();

  const initFavoritePlaylist = useCallback(async () => {
    if (!user) return null;

    try {
      // Это инициализируется при регистрации на сервере
      // Здесь мы просто получаем текущие плейлисты пользователя
      const response = await axios.get(
        `${API_BASE_URL}/playlists`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const favoritePlaylist = response.data.find(p => p.isDefault);
      return favoritePlaylist;
    } catch (err) {
      console.error('Failed to initialize favorite playlist:', err);
      return null;
    }
  }, [user]);

  return { initFavoritePlaylist };
};
