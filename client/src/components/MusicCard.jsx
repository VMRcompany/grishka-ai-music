import React from 'react';
import './MusicCard.css';
import FavoriteButton from './FavoriteButton';

const MusicCard = ({ 
  music, 
  currentUserId,
  isFavorite,
  onToggleFavorite,
  onDeleteMusic,
  isLoadingFavorite,
  isLoadingDelete
}) => {
  const isAuthor = currentUserId === music.uploader._id;

  return (
    <div className="music-card">
      <div className="music-card-header">
        <div className="music-info">
          <h3 className="music-title">{music.title}</h3>
          <p className="music-artist">{music.artist}</p>
          {music.uploader && (
            <p className="music-uploader">By {music.uploader.username}</p>
          )}
        </div>
        {isAuthor && (
          <button
            className="delete-button"
            onClick={() => onDeleteMusic(music._id)}
            disabled={isLoadingDelete}
            title="Delete music"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="music-card-body">
        {music.description && (
          <p className="music-description">{music.description}</p>
        )}
        <div className="music-meta">
          <span className="music-genre">{music.genre || 'Other'}</span>
          <span className="music-duration">{formatDuration(music.duration)}</span>
          <span className="music-plays">▶ {music.plays || 0}</span>
        </div>
      </div>

      <div className="music-card-footer">
        <FavoriteButton
          musicId={music._id}
          isFavorite={isFavorite}
          favoriteCount={music.favoriteCount || 0}
          onToggleFavorite={onToggleFavorite}
          isLoading={isLoadingFavorite}
        />
      </div>
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export default MusicCard;
