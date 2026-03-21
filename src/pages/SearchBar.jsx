import { useState } from "react";

export default function SearchBar({ setSearchTerm }) {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    if (value.trim()) {
      setSearchTerm(value.trim());
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <input
        type="text"
        placeholder="Search songs..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        style={{
          width: "60%",
          padding: "14px 20px",
          borderRadius: "30px",
          border: "none",
          outline: "none",
          fontSize: "16px",
          background: "#222",
          color: "white",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          marginLeft: "10px",
          padding: "12px 25px",
          background: "#1DB954",
          color: "white",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Search
      </button>
    </div>
  );
}
