import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

export async function generateSongSuggestions(prompt) {
  return await runAI(prompt);
}

export async function generatePlaylistDescription(songs) {
  const prompt = `
  Create a short playlist description for these songs:
  ${songs.join(", ")}.
  Make it creative and simple.
  `;
  return await runAI(prompt);
}

export async function generateSimilarSongs(songName) {
  const prompt = `
  Suggest 5 similar songs to "${songName}".
  Only return song names in a bullet list.
  `;
  return await runAI(prompt);
}

export async function generateLyrics(songName) {
  const prompt = `
  Write original short lyrics inspired by the feel of "${songName}".
  Do not copy actual song lyrics.
  `;
  return await runAI(prompt);
}

async function runAI(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Error. Try again.";
  }
}
