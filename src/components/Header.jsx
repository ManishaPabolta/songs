import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <h1>🎵 Feel These Songs 🎵</h1>
      <nav>
        {/* <Link to="/">Home</Link> */}
        {/* <Link to="/MyFeeling">Feeling</Link> */}
        {/* <Link to="/SadSongs">Sad Songs</Link> */}
        <Link to="/">Mix Songs</Link>
        {/* <Link to="/Shayari">Shayari</Link> */}
        {/* <Link to="/player">Player</Link> */}
      </nav>
   </header>
  );
}

export default Header;
