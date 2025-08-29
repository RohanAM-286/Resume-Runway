import { extractTextFromFile } from "../services/extractText.js";
import { analyzeWithOpenAI } from "../services/openaiService.js";

export async function analyzeResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractTextFromFile(req.file);
    if (!text) return res.status(400).json({ error: "Could not extract text" });

    const analysis = await analyzeWithOpenAI(text);

    return res.json({
      ok: true,
      analysis,
      meta: {
        filename: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
