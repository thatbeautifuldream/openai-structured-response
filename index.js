import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the resume schema
const ResumeSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number(),
    })
  ),
  workExperience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      responsibilities: z.array(z.string()),
    })
  ),
  skills: z.array(z.string()),
});

async function parseResume(resumeText) {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: "Extract the resume information from the given text.",
      },
      { role: "user", content: resumeText },
    ],
    response_format: zodResponseFormat(ResumeSchema, "resume"),
  });

  return completion.choices[0].message.parsed;
}

// Example usage
const resumeText = `
John Doe
Email: john.doe@example.com
Phone: (123) 456-7890

Education:
- Bachelor of Science in Computer Science, University of Technology, 2020

Work Experience:
- Software Engineer, Tech Corp
  June 2020 - Present
  - Developed and maintained web applications
  - Collaborated with cross-functional teams
  - Implemented new features and optimized existing codebase

Skills: JavaScript, React, Node.js, Python, SQL
`;

try {
  const parsedResume = await parseResume(resumeText);
  console.log(JSON.stringify(parsedResume, null, 2));
} catch (error) {
  console.error("Error parsing resume:", error);
}
