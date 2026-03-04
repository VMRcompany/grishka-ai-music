import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SearchResults.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SearchResults = ({ query, onClose }) => {
  const [music, setMusic] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAll = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setMusic([]);
      setPlaylists([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Search music
      const musicResponse = await axios.get(
        `${API_BASE_URL}/music/search?q=${encodeURIComponent(searchQuery)}`
      );
      setMusic(musicResponse.data);

      // Search public playlists
      const playlistResponse = await axios.get(
        `${API_BASE_URL}/playlists/search?q=${encodeURIComponent(searchQuery)}`
      );
      setPlaylists(playlistResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchAll(query);
  }, [query, searchAll]);

  if (!query) {
    return null;
  }

  return (
    <div className="search-results-overlay" onClick={onClose}>
      <div className="search-results" onClick={(e) => e.stopPropagation()}>
        <div className="search-results-header">
          <h3>Search Results for "{query}"</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading && <p className="search-loading">Loading...</p>}
        {error && <p className="search-error">{error}</p>}

        {!loading && music.length === 0 && playlists.length === 0 && (
          <p className="search-empty">No results found</p>
        )}

        {!loading && (
          <>
            {playlists.length > 0 && (
              <div className="search-section">
                <h4>Playlists ({playlists.length})</h4>
                <div className="playlists-list">
                  {playlists.map(playlist => (
                    <div key={playlist._id} className="playlist-item">
                      <div className="playlist-info">
                        <h5>{playlist.name}</h5>
                        {playlist.description && (
                          <p className="playlist-desc">{playlist.description}</p>
                        )}
                        {playlist.user && (
                          <p className="playlist-user">by {playlist.user.username}</p>
                        )}
                      </div>
                      <div className="playlist-meta">
                        <span className="playlist-count">
                          {playlist.musics?.length || 0} tracks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {music.length > 0 && (
              <div className="search-section">
                <h4>Tracks ({music.length})</h4>
                <div className="music-list">
                  {music.slice(0, 10).map(track => (
                    <div key={track._id} className="music-item">
                      <div className="music-info">
                        <h5>{track.title}</h5>
                        <p className="music-artist">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
