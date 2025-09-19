import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";

export async function extractTextFromFile(file) {
  const mime = file.mimetype.toLowerCase();

  if (mime.includes("pdf")) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text?.trim() || "";
  }
  if (mime.includes("wordprocessingml") || file.originalname.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return value.trim();
  }
  if (mime.startsWith("text/") || file.originalname.endsWith(".txt")) {
    return file.buffer.toString("utf8").trim();
  }
  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}
