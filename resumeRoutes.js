import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { Document, Packer } from "docx";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import mammoth from "mammoth"; // For DOCX text extraction

dotenv.config();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/resume/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Resume file required" });

    let resumeText = "";

    // Determine file type
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      resumeText = data.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const prompt = `
      You are an expert resume reviewer. Analyze this resume and provide:
      1. Health score (0-100)
      2. Strengths
      3. Weaknesses
      4. Suggestions to improve
      5. Enhanced resume text with improvements implemented

      Respond strictly in JSON format like:
      {
        "healthScore": number,
        "strengths": ["..."],
        "weaknesses": ["..."],
        "suggestions": ["..."],
        "enhancedResume": "..." 
      }

      Resume:
      ${resumeText}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultText = completion.choices[0].message.content;

    // Parse JSON safely
    let jsonResult;
    try {
      jsonResult = JSON.parse(resultText);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON response from OpenAI" });
    }

    res.json(jsonResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

export default router;
