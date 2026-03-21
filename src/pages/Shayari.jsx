import { useEffect, useState } from "react";

export default function Shayari() {
  // const [shayari, setShayari] = useState([]);
  // const [visible, setVisible] = useState(5);

  // useEffect(() => {
  //   fetch("https://type.fit/api/quotes") 
  //     .then((res) => res.json())
  //     .then((data) => setShayari(data))
  //     .catch((err) => console.error("Error fetching shayari:", err));
  // }, []);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (
  //       window.innerHeight + document.documentElement.scrollTop + 1 >=
  //       document.documentElement.scrollHeight
  //     ) {
  //       setVisible((prev) => prev + 5);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 flex flex-col items-center py-10">
      {/* <h1 className="text-3xl font-extrabold text-pink-700 mb-6 drop-shadow-lg">
        ❤️ Infinite Shayari / Quotes ❤️
      </h1>

      <div className="w-full max-w-2xl px-4 space-y-6">
        {shayari.slice(0, visible).map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-2xl p-5 text-center hover:scale-105 transform transition duration-300"
          >
            <p className="text-lg text-gray-700 font-medium leading-relaxed italic">
              "{item.text}"
            </p>
            <p className="mt-3 text-sm font-semibold text-pink-600">
              — {item.author || "Anonymous"}
            </p>
          </div>
        ))}
      </div>

      {visible < shayari.length && (
        <p className="mt-6 text-gray-500 animate-pulse">
          ⏳ Loading more shayari...
        </p>
      )} */}
    </div>
  );
}
