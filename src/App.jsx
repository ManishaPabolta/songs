import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
// import Home from "./pages/Home";
// import Player from "./pages/Player";
// import SadSongs from "./pages/SadSongs";
// import MyFeeling from "./pages/Feeling";
import MixSongs from "./pages/MixSongs";
// import Shayari from "./pages/Shayari";
import "./App.css";

function App() {
  return (
    <Router>
      <Header />
      <Routes>     <Route path="/" element={<MixSongs />} />
        {/* <Route path="/" element={<Home />} /> */}
       {/* <Route path="/player" element={<Player />} /> */}
        {/* <Route path="/SadSongs" element={<SadSongs />} /> */}
        {/* <Route path="/MyFeeling" element={<MyFeeling />} /> */}
   
        {/* <Route path="/Shayari" element={<Shayari />} /> */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
