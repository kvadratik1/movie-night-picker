import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { getMovieMedia } from "./services/tmdbService.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const requiredFields = ["mood", "time", "genre", "people"];

function getMissingFields(body) {
  return requiredFields.filter((field) => !String(body[field] ?? "").trim());
}

function parseRecommendation(text) {
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { title: "Movie recommendation", reason: cleaned };
  }
}

async function recommendMovie(req, res) {
  try {
    const { mood, time, genre, people } = req.body;
    const missingFields = getMissingFields(req.body);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    const systemPrompt =
      'You are an AI movie recommender. Recommend exactly one movie based on mood, available time, preferred genre, and audience. Return only JSON with "title", "year", "genre", and "reason".';

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: `${systemPrompt}

Mood: ${mood}
Available time: ${time}
Preferred genre: ${genre}
Audience: ${people}`,
    });

    const movie = parseRecommendation(response.text ?? "");
    const movieMedia = await getMovieMedia(movie);

    return res.json({
      movie: {
        ...movie,
        tmdbId: movieMedia.tmdbId,
        images: movieMedia.images,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Could not recommend a movie right now. Please try again.",
    });
  }
}

app.post("/recommend-movie", recommendMovie);
app.post("/recomend-movie", recommendMovie);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
