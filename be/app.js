import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.post("/recomend-movie", async (req, res) => {
  try {
    const { mood, time, genre, people } = req.body;
    if (!mood || !time || !genre || !people) {
      return res.status(400).json({
        error: "mood, time, genre, and people are required",
      });
    }

    const systemPrompt =
      "You are an AI movie recommender based on four params like mood, time, genre and people recommend one movie. Return only json.";

    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL,
      input: "Explain how AI works in a few words",
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
