// SongCard.jsx
import React from "react";
import "./Home.css";

export default function SongCard({ song, onPlay, onToggleFav, isFav }) {
  // song: { id, title, thumb, durationSec }
  return (
    <div className="song-card">
      <img className="song-thumb" src={song.thumb} alt={song.title} />
      <div className="song-info">
        <div className="song-title" title={song.title}>{song.title}</div>
        <div className="song-meta-row">
          <div className="song-duration">{formatSec(song.durationSec)}</div>
          <div className="song-actions">
            <button className="play-btn" onClick={() => onPlay(song)}>Play</button>
            <button
              className={`fav-btn ${isFav ? "isfav" : ""}`}
              onClick={() => onToggleFav(song)}
            >
              {isFav ? "Remove ♥" : "Fav ♡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSec(sec) {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
