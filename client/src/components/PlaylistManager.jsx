import React, { useState } from 'react';
import './PlaylistManager.css';

const PlaylistManager = ({ 
  playlists, 
  onCreatePlaylist, 
  onUpdatePlaylist, 
  onDeletePlaylist,
  loading 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Playlist name is required');
      return;
    }

    try {
      if (editingPlaylistId) {
        await onUpdatePlaylist(
          editingPlaylistId,
          formData.name,
          formData.description,
          formData.isPublic
        );
      } else {
        await onCreatePlaylist(
          formData.name,
          formData.description,
          formData.isPublic
        );
      }

      setFormData({ name: '', description: '', isPublic: false });
      setShowCreateForm(false);
      setEditingPlaylistId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (playlist) => {
    setFormData({
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic || false
    });
    setEditingPlaylistId(playlist._id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingPlaylistId(null);
    setFormData({ name: '', description: '', isPublic: false });
  };

  const handleDelete = (playlistId) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      onDeletePlaylist(playlistId);
    }
  };

  const publicPlaylists = playlists.filter(p => p.isPublic);
  const privatePlaylists = playlists.filter(p => !p.isPublic && !p.isDefault);
  const defaultPlaylists = playlists.filter(p => p.isDefault);

  return (
    <div className="playlist-manager">
      <div className="playlist-manager-header">
        <h2>My Playlists</h2>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={loading}
        >
          {showCreateForm ? '✕ Cancel' : '+ New Playlist'}
        </button>
      </div>

      {showCreateForm && (
        <form className="playlist-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playlist-name">Playlist Name *</label>
            <input
              id="playlist-name"
              type="text"
              placeholder="Enter playlist name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="playlist-desc">Description</label>
            <textarea
              id="playlist-desc"
              placeholder="Enter playlist description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="form-group checkbox">
            <label htmlFor="is-public">
              <input
                id="is-public"
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                disabled={loading}
              />
              <span>Public - This playlist will be searchable to other users</span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingPlaylistId ? 'Update Playlist' : 'Create Playlist')}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {defaultPlaylists.length > 0 && (
        <div className="playlists-group">
          <h3>Special Playlists</h3>
          <div className="playlists-grid">
            {defaultPlaylists.map(playlist => (
              <div key={playlist._id} className="playlist-card special">
                <div className="playlist-card-header">
                  <h4>{playlist.name}</h4>
                  <span className="special-badge">★</span>
                </div>
                <p className="track-count">{playlist.musics?.length || 0} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {publicPlaylists.length > 0 && (
        <div className="playlists-group">
          <h3>Public Playlists (Searchable)</h3>
          <div className="playlists-grid">
            {publicPlaylists.map(playlist => (
              <div key={playlist._id} className="playlist-card public">
                <div className="playlist-card-header">
                  <h4>{playlist.name}</h4>
                  <span className="public-badge">🔓</span>
                </div>
                {playlist.description && (
                  <p className="playlist-description">{playlist.description}</p>
                )}
                <p className="track-count">{playlist.musics?.length || 0} tracks</p>
                <div className="playlist-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(playlist)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(playlist._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {privatePlaylists.length > 0 && (
        <div className="playlists-group">
          <h3>Private Playlists</h3>
          <div className="playlists-grid">
            {privatePlaylists.map(playlist => (
              <div key={playlist._id} className="playlist-card private">
                <div className="playlist-card-header">
                  <h4>{playlist.name}</h4>
                  <span className="private-badge">🔒</span>
                </div>
                {playlist.description && (
                  <p className="playlist-description">{playlist.description}</p>
                )}
                <p className="track-count">{playlist.musics?.length || 0} tracks</p>
                <div className="playlist-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(playlist)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(playlist._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playlists.length === 0 && !showCreateForm && (
        <div className="empty-state">
          <p>You don't have any playlists yet</p>
          <p className="empty-hint">Create your first playlist to get started!</p>
        </div>
      )}
    </div>
  );
};

export default PlaylistManager;
