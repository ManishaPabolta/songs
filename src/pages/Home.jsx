import React, { useEffect, useRef, useState } from "react";
import singersList from "./singers";
import "./Home.css";

const API_KEY = "AIzaSyAAeyO-72VzEBIE3us-f23bCZBjB0OS5u8";

// SETTINGS
const TARGET_SONGS = 500; // target number of songs to gather per singer
const MAX_PAGES = 12; // how many search pages to try (50 results per page)
const SEARCH_MAX_RESULTS = 50;
const MIN_DURATION = 300; // 5 minutes (sec)
const MAX_DURATION = 420; // 7 minutes (sec)

// helpers
const isoToSeconds = (iso) => {
  if (!iso) return 0;
  const h = parseInt((iso.match(/(\d+)H/) || [])[1] || 0, 10);
  const m = parseInt((iso.match(/(\d+)M/) || [])[1] || 0, 10);
  const s = parseInt((iso.match(/(\d+)S/) || [])[1] || 0, 10);
  return h * 3600 + m * 60 + s;
};

const formatDuration = (sec) => {
  if (!sec && sec !== 0) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function Home() {
  // main UI
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [activeSinger, setActiveSinger] = useState(null);

  // songs & search inside songs list
  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState("");
  const [songsSearch, setSongsSearch] = useState(""); // full-width search inside songs list

  // YouTube player states
  const [ytReady, setYtReady] = useState(false);
  const ytPlayerRef = useRef(null);
  const ytContainerRef = useRef(null);

  const [activeSong, setActiveSong] = useState(null); // { ...song, youtubeId, _index }
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // inject or ensure YT API
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

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
      } catch {}
      ytPlayerRef.current = null;
    };
  }, []);

  // Ensure YT Player
  const ensureYtPlayer = (videoId) => {
    if (!ytReady) return null;
    try {
      if (ytPlayerRef.current?.getVideoData?.().video_id === videoId) return ytPlayerRef.current;
    } catch (e) {}
    try {
      if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
    } catch (e) {}
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
            try {
              clearInterval(ytPlayerRef.current?._interval);
            } catch {}
          }
          if (e.data === 0) {
            // ended
            handleNext();
          }
        },
      },
    });
    return ytPlayerRef.current;
  };

  // Fetch singular YouTube videoId for a song (fallback)
  const fetchYouTubeIdSingle = async (song) => {
    try {
      const q = `${song.title} ${song.artist} audio`;
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
          q
        )}&key=${API_KEY}`
      );
      const data = await res.json();
      return data.items?.[0]?.id?.videoId || null;
    } catch {
      return null;
    }
  };

  // play a song (shows mini-player by default)
  const playSong = async (song) => {
    try {
      const youtubeId = song.id || song.videoId || (await fetchYouTubeIdSingle(song));
      if (!youtubeId) {
        alert("YouTube ID not found for this song.");
        return;
      }
      const index = song.index ?? songs.findIndex((s) => s.id === song.id);
      setActiveSong({ ...song, youtubeId, _index: index >= 0 ? index : 0 });
      setIsFullScreen(false); // show mini-player initially
      setTimeout(() => {
        ensureYtPlayer(youtubeId)?.playVideo();
      }, 200);
    } catch (err) {
      console.error("playSong error:", err);
    }
  };

  const handleNext = () => {
    if (!activeSong) return;
    const nextIndex = (activeSong._index + 1) % songs.length;
    const next = songs[nextIndex];
    if (next) playSong(next);
  };

  const handlePrev = () => {
    if (!activeSong) return;
    const prevIndex = (activeSong._index - 1 + songs.length) % songs.length;
    const prev = songs[prevIndex];
    if (prev) playSong(prev);
  };

  // Load songs for a singer (many pages) — filtered 5–7 minutes
  const loadSongs = async (name) => {
    setSongsLoading(true);
    setSongsError("");
    setSongs([]);
    setSongsSearch("");
    setActiveSong(null);
    setIsFullScreen(false);

    try {
      let all = [];
      let nextPageToken = "";
      for (let page = 0; page < MAX_PAGES; page++) {
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${SEARCH_MAX_RESULTS}&q=${encodeURIComponent(
            name + " songs"
          )}&pageToken=${nextPageToken}&key=${API_KEY}`
        );
        const searchData = await searchRes.json();
        if (!searchData || !searchData.items) break;

        const ids = searchData.items.map((i) => i.id?.videoId).filter(Boolean);
        if (ids.length === 0) {
          nextPageToken = searchData.nextPageToken || "";
          if (!nextPageToken) break;
          continue;
        }

        const idsStr = ids.join(",");
        const videosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${idsStr}&key=${API_KEY}`
        );
        const videosData = await videosRes.json();

        const filtered = (videosData.items || [])
          .map((v) => {
            const sec = isoToSeconds(v.contentDetails?.duration);
            return {
              id: v.id,
              title: v.snippet.title,
              thumb: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url || "",
              artist: name,
              durationSec: sec,
              durationText: formatDuration(sec),
            };
          })
          .filter((v) => v.durationSec >= MIN_DURATION && v.durationSec <= MAX_DURATION);

        const withIndex = filtered.map((f, idx) => ({ ...f, index: all.length + idx }));
        all = [...all, ...withIndex];

        if (all.length >= TARGET_SONGS) break;

        nextPageToken = searchData.nextPageToken || "";
        if (!nextPageToken) break;
      }

      const final = all.slice(0, TARGET_SONGS);
      setSongs(final);
      setView("singer");
      setActiveSinger({ name });
    } catch (err) {
      console.error("loadSongs error:", err);
      setSongsError("API Error, check key/quota.");
    } finally {
      setSongsLoading(false);
    }
  };

  // Filtered songs based on songsSearch input
  const filteredSongs = songsSearch
    ? songs.filter((s) =>
        `${s.title} ${s.artist}`.toLowerCase().includes(songsSearch.toLowerCase())
      )
    : songs;

  return (
    <div className="music-app">
      {/* Hidden YT container */}
      <div ref={ytContainerRef} style={{ width: 0, height: 0, position: "absolute", left: -9999 }} />

      {/* HOME */}
      {view === "home" && (
        <div className="page fade">
          <h1 className="title">🎵 Music Library</h1>

          <input
            className="input"
            placeholder="Search singers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="grid">
            {singersList
              .filter((s) => (query ? s.name.toLowerCase().includes(query.toLowerCase()) : true))
              .map((s) => (
                <div
                  key={s.name}
                  className="card"
                  onClick={() => {
                    setActiveSinger(s);
                    setView("singer");
                    loadSongs(s.name);
                  }}
                >
                  <img src={s.img} className="card-img" alt={s.name} />
                  <p className="card-name">{s.name}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SINGER / SONGS PAGE */}
      {view === "singer" && (
        <div className="page fade">
          <button
            className="back"
            onClick={() => {
              setView("home");
              setSongs([]);
              setActiveSinger(null);
            }}
          >
            ← Back
          </button>

          <h2 className="subtitle">{activeSinger?.name}</h2>

          {/* Full-width large search bar inside songs page (Option C) */}
          <div style={{ padding: "0 18px 10px 18px" }}>
            <input
              className="songs-search"
              placeholder={`Search ${activeSinger?.name} songs...`}
              value={songsSearch}
              onChange={(e) => setSongsSearch(e.target.value)}
            />
          </div>

          {songsLoading && <p className="loading">Loading songs... this can take a while for large lists</p>}
          {songsError && <p className="error">{songsError}</p>}

          <div className="songs-grid">
            {filteredSongs.length === 0 && !songsLoading && <p style={{ padding: 16 }}>No songs found.</p>}

            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="song-card"
                onClick={() => playSong(song)}
                title={`${song.title} — ${song.durationText}`}
              >
                <img src={song.thumb} className="song-img" alt={song.title} />
                <div className="song-info">
                  <p className="song-title">{song.title}</p>
                  <span className="song-duration">{song.durationText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL SCREEN (Spotify style) */}
      {activeSong && isFullScreen && (
        <div className="full-player" role="dialog" aria-modal="true">
          <button
            className="close-full"
            onClick={() => setIsFullScreen(false)}
            aria-label="Close"
          >
            ✕
          </button>

          <img className="player-cover-large" src={activeSong.thumb} alt={activeSong.title} />

          <h1>{activeSong.title}</h1>
          <p style={{ opacity: 0.8 }}>{activeSong.artist}</p>

          <div className="controls-row">
            <button onClick={handlePrev}>⏮</button>

            <button
              onClick={() => {
                const st = ytPlayerRef.current?.getPlayerState?.();
                if (st === 1) ytPlayerRef.current.pauseVideo();
                else ytPlayerRef.current.playVideo();
              }}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <button onClick={handleNext}>⏭</button>
          </div>

          <div className="audio-wrap" style={{ alignItems: "center", justifyContent: "center" }}>
            <span>{formatDuration(currentTime)}</span>

            <div
              className="progress-bar"
              onClick={(e) => {
                if (!ytPlayerRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const target = (duration || 0) * pct;
                ytPlayerRef.current.seekTo(target, true);
                setCurrentTime(target);
              }}
            >
              <div className="progress-filled" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
            </div>

            <span>{formatDuration(duration)}</span>
          </div>

          <div className="queue-list">
            {songs.map((s, i) => (
              <div
                key={s.id + "-" + i}
                className={`queue-item ${activeSong._index === i ? "active" : ""}`}
                onClick={() => playSong({ ...s, index: i })}
              >
                <img src={s.thumb} alt={s.title} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#bdbdbd" }}>{s.durationText}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER MINI PLAYER */}
      {activeSong && !isFullScreen && (
        <div
          className="footer-player"
          onClick={() => {
            setIsFullScreen(true);
          }}
        >
          <img src={activeSong.thumb} alt={activeSong.title} />
          <div className="footer-info">
            <div>{activeSong.title}</div>
            <div>{activeSong.artist}</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          >
            ⏮
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const st = ytPlayerRef.current?.getPlayerState?.();
              if (st === 1) ytPlayerRef.current.pauseVideo();
              else ytPlayerRef.current.playVideo();
            }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          >
            ⏭
          </button>
        </div>
      )}
    </div>
  );
}






































// import "./MixSong.css";
// import { useEffect, useState } from "react";

// export default function MixSongs() {
//   const [songs, setSongs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeSong, setActiveSong] = useState(null);
//   const [favorites, setFavorites] = useState([]);
//   const [search, setSearch] = useState("arijit singh");
//   const [query, setQuery] = useState("arijit singh");

//   // Fetch Songs from API
//   useEffect(() => {
//     async function loadSongs() {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `https://itunes.apple.com/search?term=${query}&media=music&limit=25`
//         );
//         const data = await res.json();
//         setSongs(data.results);
//       } catch (error) {
//         console.error("API Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadSongs();
//   }, [query]);

//   const toggleFavorite = (song) => {
//     if (favorites.some((fav) => fav.trackId === song.trackId)) {
//       setFavorites(favorites.filter((fav) => fav.trackId !== song.trackId));
//     } else {
//       setFavorites([...favorites, song]);
//     }
//   };

//   return (
//     <div className="mixsong-layout">

//       {/* Background Blur */}
//       <div
//         className="dynamic-bg"
//         style={{
//           backgroundImage: activeSong
//             ? `url(${activeSong.artworkUrl100})`
//             : "url(https://i.imgur.com/fdLdQfG.jpeg)",
//         }}
//       />

//       {/* SEARCH BAR */}
//       <div className="search-box">
//         <input
//           type="text"
//           placeholder="Search any music, artist..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <button onClick={() => setQuery(search)}>Search</button>
//       </div>

//       <h1 className="page-title">🎵 Mix Songs – Spotify Styled</h1>

//       {loading ? (
//         <p className="loading">Loading songs...</p>
//       ) : (
//         <div className="song-grid">
//           {songs.map((song, index) => (
//             <div
//               className="song-card"
//               key={index}
//               onClick={() => setActiveSong(song)}
//             >
//               <img
//                 src={song.artworkUrl100}
//                 alt={song.trackName}
//                 className="song-img"
//               />

//               <div className="song-info">
//                 <h3 className="song-title">{song.trackName}</h3>
//                 <p className="artist">{song.artistName}</p>
//               </div>

//               {/* Favorite Button */}
//               <button
//                 className={`fav-btn ${
//                   favorites.some((fav) => fav.trackId === song.trackId)
//                     ? "active"
//                     : ""
//                 }`}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   toggleFavorite(song);
//                 }}
//               >
//                 ❤️
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* PLAYER SECTION */}
//       {activeSong && (
//         <div className="player-bar">
//           <img
//             src={activeSong.artworkUrl100}
//             alt="cover"
//             className="player-img"
//           />

//           <div className="player-info">
//             <h3>{activeSong.trackName}</h3>
//             <p>{activeSong.artistName}</p>
//           </div>

//           <audio
//             controls
//             autoPlay
//             src={activeSong.previewUrl}
//             className="player-audio"
//           ></audio>
//         </div>
//       )}
//     </div>
//   );
// }
