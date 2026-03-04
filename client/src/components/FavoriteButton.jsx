import React from 'react';
import './FavoriteButton.css';

const FavoriteButton = ({ 
  musicId, 
  isFavorite, 
  favoriteCount, 
  onToggleFavorite,
  isLoading 
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(musicId, isFavorite);
  };

  return (
    <div className="favorite-button-container">
      <button
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-label="Add to favorites"
      >
        <svg
          className="favorite-icon"
          viewBox="0 0 24 24"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <span className="favorite-count">{favoriteCount}</span>
    </div>
  );
};

export default FavoriteButton;
