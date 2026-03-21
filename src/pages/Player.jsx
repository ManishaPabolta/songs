import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Player.css";

export default function Player() {
  // const { state } = useLocation();
  // const navigate = useNavigate();
  // const audioRef = useRef(null);

  // const song = state?.song;

  // const [isPlaying, setIsPlaying] = useState(false);
  // const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.play();
  //     setIsPlaying(true);
  //   }
  // }, []);

  // const togglePlay = () => {
  //   if (isPlaying) {
  //     audioRef.current.pause();
  //   } else {
  //     audioRef.current.play();
  //   }
  //   setIsPlaying(!isPlaying);
  // };

  // const updateProgress = () => {
  //   const current = audioRef.current.currentTime;
  //   const total = audioRef.current.duration;
  //   setProgress((current / total) * 100);
  // };

  // const handleSeek = (e) => {
  //   const width = e.target.clientWidth;
  //   const clickX = e.nativeEvent.offsetX;
  //   const duration = audioRef.current.duration;
  //   audioRef.current.currentTime = (clickX / width) * duration;
  // };

  // return (
  //   <div className="player-container">
  //     {/* Back Button */}
  //     <button className="back-btn" onClick={() => navigate("/")}>
  //       ← Back
  //     </button>

  //     <div className="player-card">
  //       <img src={song.cover} alt="cover" className="player-cover" />

  //       <h2 className="player-title">{song.title}</h2>
  //       <p className="player-artist">{song.artist}</p>

  //       {/* AUDIO */}
  //       <audio
  //         ref={audioRef}
  //         src={song.preview}
  //         onTimeUpdate={updateProgress}
  //       />

  //       {/* Progress Bar */}
  //       <div className="progress-bar" onClick={handleSeek}>
  //         <div className="progress" style={{ width: progress + "%" }}></div>
  //       </div>

  //       {/* Controls */}
  //       <button className="play-btn" onClick={togglePlay}>
  //         {isPlaying ? "⏸ Pause" : "▶ Play"}
  //       </button>

  //       <p className="duration">
  //         Duration: {Math.floor(song.duration / 60)}:
  //         {(song.duration % 60).toString().padStart(2, "0")}
  //       </p>
  //     </div>
  //   </div>
  // );
}
