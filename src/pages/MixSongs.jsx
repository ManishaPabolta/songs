
// AIzaSyAAeyO-72VzEBIE3us-f23bCZBjB0OS5u8

// src/MixSongs.jsx
import "./MixSong.css";
import { useEffect, useState, useRef } from "react";
import { generateLyrics } from "./gemini";

export default function MixSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSong, setActiveSong] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("arijit singh");
  const [query, setQuery] = useState("arijit singh");
  const [lyrics, setLyrics] = useState("");
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);

  const YT_API_KEY = "AIzaSyAAeyO-72VzEBIE3us-f23bCZBjB0OS5u8";

  // ---------- Load songs ----------
  useEffect(() => {
    async function loadSongs() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50`
        );
        const data = await res.json();
        setSongs(data.results || []);
      } catch (error) {
        console.error("API Error:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }
    loadSongs();
  }, [query]);

  // ---------- Load YouTube API ----------
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  const destroyYtPlayer = () => {
    try {
      if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
    } catch {}
    ytPlayerRef.current = null;
  };

  const fetchYouTubeId = async (song) => {
    try {
      const q = `${song.trackName} ${song.artistName} audio`;
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
          q
        )}&key=${YT_API_KEY}`
      );
      const data = await res.json();
      return data.items?.[0]?.id?.videoId || null;
    } catch {
      return null;
    }
  };

  const ensureYtPlayer = (videoId) => {
    if (!ytReady) return null;
    if (ytPlayerRef.current?.getVideoData?.().video_id === videoId)
      return ytPlayerRef.current;

    destroyYtPlayer();

    ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
      height: "0",
      width: "0",
      videoId,
      playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 },
      events: {
        onStateChange: (e) => {
          if (e.data === 1) {
            setIsPlaying(true);
            const interval = setInterval(() => {
              if (ytPlayerRef.current?.getCurrentTime) {
                setCurrentTime(ytPlayerRef.current.getCurrentTime());
                setDuration(ytPlayerRef.current.getDuration());
              }
            }, 500);
            ytPlayerRef.current._interval = interval;
          } else {
            setIsPlaying(false);
            clearInterval(ytPlayerRef.current?._interval);
          }
          if (e.data === 0) handleNext();
        },
      },
    });

    return ytPlayerRef.current;
  };

  const playIndex = (index) => {
    const s = songs[index];
    if (!s) return;

    (async () => {
      const youtubeId = await fetchYouTubeId(s);
      setActiveSong({ ...s, youtubeId, _index: index });
      setIsFullScreen(true);

      if (youtubeId && ytReady) {
        setTimeout(() => {
          ensureYtPlayer(youtubeId)?.playVideo();
        }, 200);
      }
    })();
  };

  const handleNext = () => {
    if (!activeSong) return;
    const nextIndex = (activeSong._index + 1) % songs.length;
    playIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!activeSong) return;
    const prevIndex = (activeSong._index - 1 + songs.length) % songs.length;
    playIndex(prevIndex);
  };

  const handleDownload = () => {
    alert("Full song download is not allowed by YouTube API ❌");
  };

  const handleAIGenerateLyrics = async (song) => {
    if (!song) return;
    try {
      const text = await generateLyrics(song.trackName, song.artistName);
      setLyrics(text || "No lyrics found.");
      setShowLyricsModal(true);
    } catch {
      setLyrics("Error generating lyrics.");
      setShowLyricsModal(true);
    }
  };

  useEffect(() => {
    return () => destroyYtPlayer();
  }, []);

  function formatMillis(sec) {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="mixsong-layout">
      <div
        ref={ytContainerRef}
        style={{ width: 0, height: 0, position: "absolute", left: -9999 }}
      />

      <div
        className="dynamic-bg"
        style={{
          backgroundImage: activeSong
            ? `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
               url(${activeSong.artworkUrl100.replace("100x100bb","1400x1400bb")})`
            : "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://i.imgur.com/fdLdQfG.jpeg)",
        }}
      />

      {/* GRID WHEN NO SONG SELECTED */}
      {!activeSong || !isFullScreen ? (
        <>
          <div className="top-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search music..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
              />
              <button onClick={() => setQuery(search)}>Search</button>
            </div>
          </div>

          <h1 className="page-title">🎵 Mix Songs</h1>

          <div className="content-grid">
            {loading ? (
              <p>Loading...</p>
            ) : (
              songs.map((song, idx) => (
                <div
                  key={song.trackId || idx}
                  className={`song-box ${activeSong?._index === idx ? "active" : ""}`}
                  onClick={() => playIndex(idx)}
                >
                  <img
                    src={song.artworkUrl100.replace("100x100bb", "300x300bb")}
                  />

                  <div className="hover-play">▶</div>

                  <div className="song-name">{song.trackName}</div>
                  <div className="artist-name">{song.artistName}</div>
                </div>
              ))
            )}
          </div>
        </>
      ) : null}

      {/* FULL SCREEN PLAYER */}
      {activeSong && isFullScreen && (
        <div className="full-player">
          <div className="player-inner">
            <button
              className="close-player"
              onClick={() => setIsFullScreen(false)}
            >
              ✕
            </button>

            <img
              className="player-cover-large"
              src={activeSong.artworkUrl100.replace("100x100bb", "800x800bb")}
            />

            <h1>{activeSong.trackName}</h1>
            <p>{activeSong.artistName}</p>

            <div className="controls-row">
              <button onClick={handlePrev}>⏮</button>
              <button
                onClick={() => {
                  if (ytPlayerRef.current?.getPlayerState) {
                    const st = ytPlayerRef.current.getPlayerState();
                    if (st === 1) ytPlayerRef.current.pauseVideo();
                    else ytPlayerRef.current.playVideo();
                  }
                }}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <button onClick={handleNext}>⏭</button>
              <button onClick={handleDownload}>⬇</button>
              <button onClick={() => handleAIGenerateLyrics(activeSong)}>📝</button>
              <button
                onClick={() => {
                  if (favorites.some((f) => f.trackId === activeSong.trackId))
                    setFavorites(favorites.filter((f) => f.trackId !== activeSong.trackId));
                  else setFavorites([...favorites, activeSong]);
                }}
              >
                {favorites.some((f) => f.trackId === activeSong.trackId) ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Progress */}
            <div className="audio-wrap">
              <span>{formatMillis(currentTime)}</span>
              <div
                className="progress-bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  ytPlayerRef.current?.seekTo(pct * ytPlayerRef.current.getDuration(), true);
                }}
              >
                <div
                  className="progress-filled"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span>{formatMillis(duration)}</span>
            </div>

            {/* Queue */}
            <div className="queue-list">
              {songs.map((s, i) => (
                <div
                  key={s.trackId || i}
                  className={`queue-item ${activeSong._index === i ? "active" : ""}`}
                  onClick={() => playIndex(i)}
                >
                  <img src={s.artworkUrl60} />
                  <div>{s.trackName}</div>
                  <div>{s.artistName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER MINI PLAYER */}
      {activeSong && !isFullScreen && !showLyricsModal && (
        <div className="footer-player" onClick={() => setIsFullScreen(true)}>
          <img src={activeSong.artworkUrl100} />
          <div className="footer-info">
            <div>{activeSong.trackName}</div>
            <div>{activeSong.artistName}</div>
          </div>
          <div className="footer-controls">
            <button onClick={handlePrev}>⏮</button>
            <button
              onClick={() => {
                if (ytPlayerRef.current?.getPlayerState) {
                  const st = ytPlayerRef.current.getPlayerState();
                  if (st === 1) ytPlayerRef.current.pauseVideo();
                  else ytPlayerRef.current.playVideo();
                }
              }}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>
            <button onClick={handleNext}>⏭</button>
          </div>
          <div className="footer-time">
            {formatMillis(currentTime)} / {formatMillis(duration)}
          </div>
        </div>
      )}

      {/* LYRICS MODAL */}
      {showLyricsModal && (
        <div className="modal" onClick={() => setShowLyricsModal(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <h2>AI Lyrics</h2>
            <pre>{lyrics}</pre>
            <button onClick={() => setShowLyricsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
