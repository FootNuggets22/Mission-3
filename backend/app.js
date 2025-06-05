
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";

// sanitize-html
import sanitizeHtml from "sanitize-html";

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
  
  // sanitize user input and trim whitespace
  const jobTitle = sanitizeHtml(req.body.jobTitle || "", {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  const userMessage = sanitizeHtml(req.body.userMessage || "", {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  // Raw history
  const history = req.body.history;

  // Limiting input content lengths
  const MAX_JOB_TITLE_LENGTH = 50;
  const MAX_USER_MESSAGE_LENGTH = 500;

  if (jobTitle.length > MAX_JOB_TITLE_LENGTH) {
    return res.status(400).json({
      error: `Job title is too long. Maximum length is ${MAX_JOB_TITLE_LENGTH} characters.`,
    });
  }

  if (userMessage.length > MAX_USER_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `User message is too long. Maximum length is ${MAX_USER_MESSAGE_LENGTH} characters.`,
    });
  }

  // Determine if this is the first interaction
  const isFirstInteraction = !userMessage && (!history || history.length === 0);
  if (!jobTitle || (!isFirstInteraction && !userMessage)) {
    return res
      .status(400)
      .json({ error: "Job title is required, and user message is required for follow-up messages." });
  }

  // Get prompt for job title
  const prompt = interviewPrompt(jobTitle);

  // Ensure history is an array
  const safeHistory = Array.isArray(history) ? history : [];

  // Transform client history and build messages for Gemini API
  const constructMessages = (prompt, history, userMessage) => {
    if ((!history || history.length === 0) && !userMessage) {
      return [{ role: "user", parts: [{ text: prompt }] }];
    }

    const formattedHistory = (history || []).map(msg => ({
      // Gemini expects 'model' role instead of 'assistant'
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    return [
      { role: "user", parts: [{ text: prompt }] },
      ...formattedHistory,
      { role: "user", parts: [{ text: userMessage }] },
    ];
  };

  const messages = constructMessages(prompt, safeHistory, userMessage);

  logger("Prompt", prompt);
  logger("UserMessage", userMessage);
  logger("History", history);
  logger("API payload messages", messages);

  try {
    const modelId = "gemini-2.5-flash-preview-05-20";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("Sending messages to Gemini:", {
        prompt,
        userMessage,
        history,
        messages: JSON.stringify(messages, null, 2),
      });
    }

    const response = await axios.post(
      endpoint,
      { contents: messages },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiReply = response.data.candidates?.[0]?.content.parts?.[0]?.text;

    res.status(200).json({ reply: aiReply, status: "success 🎯" });
  } catch (error) {
    console.error("Error calling Gemini API:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to generate interview response 🔌🚫" });
  }
});

export default app;
