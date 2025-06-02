import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";

import morgan from "morgan";

import logger from "./utils/logger.js";
import interviewPrompt from "./utils/interviewPrompt.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({ message: "Gemini API is up and running 🚀" });
});

app.post("/api/interview", async (req, res) => {
  const { jobTitle, userMessage, history } = req.body;

  // Validate job title at the start of the interiview AND validate user message on subsequent calls:  
  const isFirstInteraction = !userMessage && (!history || history.length === 0);

  if (!jobTitle || (!isFirstInteraction && !userMessage)) {
    return res
      .status(400)
      .json({ error: "Job title is required, and user message is required for follow-up messages." });
  }

  // Calling imported prompt function
  const prompt = interviewPrompt(jobTitle);

  // Conversation history that will be sent to the API
  // Security: Validate history format ensuring it's an array of proper objects
  const safeHistory = Array.isArray(history) ? history : [];

  // 1. Prompt 2. History - Previous messages 3. Latest user message

  const constructMessages = (prompt, history, userMessage) => {
      if (!history.length && !userMessage) {
        return [{ role: "user", parts: [{ text: prompt }] }];          
      }
      return [
        { role: "user", parts: [{ text: prompt }] },
        ...history,
        { role: "user", parts: [{ text: userMessage }] },
      ];
  } 
  const messages = constructMessages(prompt, safeHistory, userMessage);
  
  // Calling imported logger function (dev mode only)

  logger("Prompt", prompt);
  logger("UserMessage", userMessage);
  logger("History", history);
  logger("API payload messages", messages);
  
  try {
    
    // Set gemini model variant
    const modelId = "gemini-1.5-flash-8b";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // conditional logging of Gemini data when in development mode (development logs)

    if (process.env.NODE_ENV !== "production") {
      console.log("Sending messages to Gemini:", {
        prompt,
        userMessage,
        history,
        messages: JSON.stringify(messages, null, 2),
      });
    }

    // Call Gemini API

    const response = await axios.post(
      endpoint,
      { contents: messages },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // AI model response

    const aiReply = response.data.candidates?.[0]?.content.parts?.[0]?.text;

    res.status(200).json({ aiReply, status: "success 🎯" });
  } catch (error) {
    console.error("Error calling Gemini API:", error?.response?.data || error.message || error);
    res
      .status(500)
      .json({ error: "Failed to generate interview response 🔌🚫" });
  }
});

export default app;