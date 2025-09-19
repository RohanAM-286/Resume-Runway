import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeWithOpenAI(resumeText) {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "You are a resume reviewer and ATS expert." },
      {
        role: "user",
        content: `
Analyze this resume and return JSON only:
- score (0–100)
- strengths[]
- weaknesses[]
- suggestions[]
- atsKeywords[]
- sectionScores {Experience, Skills, Education, Summary}

Resume:
${resumeText}
        `,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ResumeReview",
        schema: {
          type: "object",
          properties: {
            score: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            atsKeywords: { type: "array", items: { type: "string" } },
            sectionScores: {
              type: "object",
              properties: {
                Experience: { type: "integer" },
                Skills: { type: "integer" },
                Education: { type: "integer" },
                Summary: { type: "integer" },
              },
            },
          },
          required: ["score", "strengths", "weaknesses", "suggestions", "atsKeywords", "sectionScores"],
        },
      },
    },
  });

  return JSON.parse(response.output[0].content[0].text);
}
