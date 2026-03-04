import React, { useState, useEffect } from 'react';
import './MusicList.css';
import MusicCard from './MusicCard';

const MusicList = ({ 
  music, 
  loading, 
  currentUserId,
  onToggleFavorite,
  onDeleteMusic,
  favorites,
  isLoadingFavorite,
  isLoadingDelete
}) => {
  if (loading) {
    return (
      <div className="music-list loading">
        <p>Loading music...</p>
      </div>
    );
  }

  if (!music || music.length === 0) {
    return (
      <div className="music-list empty">
        <p>No music found</p>
      </div>
    );
  }

  return (
    <div className="music-list">
      {music.map(item => (
        <MusicCard
          key={item._id}
          music={item}
          currentUserId={currentUserId}
          isFavorite={favorites[item._id] || false}
          onToggleFavorite={onToggleFavorite}
          onDeleteMusic={onDeleteMusic}
          isLoadingFavorite={isLoadingFavorite[item._id] || false}
          isLoadingDelete={isLoadingDelete[item._id] || false}
        />
      ))}
    </div>
  );
};

export default MusicList;
