// ===================================
// ProposalPilot — Backend API Server
// Uses Gemma (open-weight) via Google GenAI
// ===================================

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Gemma via Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: 'gemma-3-27b-it',
    timestamp: new Date().toISOString(),
  });
});

// Generate proposal endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      jobDescription,
      platform = 'upwork',
      expertise = '',
      rate = '',
      name = '',
      tone = 'professional',
      portfolio = '',
    } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const prompt = buildPrompt({
      jobDescription,
      platform,
      expertise,
      rate,
      name,
      tone,
      portfolio,
    });

    const response = await ai.models.generateContent({
      model: 'gemma-3-27b-it',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const proposal = response.text;

    res.json({
      proposal,
      model: 'gemma-3-27b-it',
      tokens: response.usageMetadata?.totalTokenCount || null,
    });
  } catch (error) {
    console.error('Generation error:', error.message);

    // If API key not set or model unavailable, return helpful error
    if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
      return res.status(503).json({
        error: 'Gemma API not configured. Set GEMINI_API_KEY environment variable.',
        hint: 'Get a free key at https://aistudio.google.com/apikey',
      });
    }

    res.status(500).json({ error: 'Failed to generate proposal' });
  }
});

function buildPrompt({ jobDescription, platform, expertise, rate, name, tone, portfolio }) {
  const toneInstructions = {
    professional: 'Use a professional, polished tone. Be direct but warm.',
    friendly: 'Use a friendly, approachable tone. Show genuine enthusiasm.',
    confident: 'Use a confident, assertive tone. Lead with expertise and results.',
    consultative: 'Use a consultative, expert tone. Frame yourself as a strategic partner.',
  };

  const platformInstructions = {
    upwork: 'This is for Upwork. Start with a personal greeting. Keep it under 300 words. Upwork clients value conciseness and specificity.',
    fiverr: 'This is for Fiverr. Be brief and action-oriented. Highlight quick turnaround and clear deliverables.',
    direct: 'This is a direct email proposal. Be more formal and detailed. Include a clear call to action.',
    toptal: 'This is for Toptal. Emphasize senior-level expertise, architecture decisions, and scalability. Toptal clients expect premium quality.',
  };

  return `You are ProposalPilot, an AI assistant that helps freelancers write winning project proposals. Generate a compelling, personalized proposal based on the following:

**Job Description:**
${jobDescription}

**Platform:** ${platform}
${platformInstructions[platform] || platformInstructions.upwork}

**Tone:** ${tone}
${toneInstructions[tone] || toneInstructions.professional}

**Freelancer Details:**
- Name: ${name || 'Not provided'}
- Expertise: ${expertise || 'Infer from the job requirements'}
- Rate: ${rate || 'Not specified'}
- Portfolio: ${portfolio || 'Not provided'}

**Rules:**
1. Start with a warm, personalized greeting that references something specific from the job description.
2. Show you understand their exact problem — don't be generic.
3. Briefly explain your relevant experience and why you're the right fit.
4. Outline your approach in 3-4 bullet points.
5. If a rate was provided, mention it naturally. If not, skip pricing.
6. End with a clear call to action.
7. Keep it concise — quality over length.
8. Use markdown formatting sparingly (bold for emphasis only).
9. Sound human. No corporate jargon, no filler phrases like "I am excited to."
10. If portfolio was provided, mention it once naturally.

Write the proposal now. Output ONLY the proposal text, no meta-commentary.`;
}

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║  🚀 ProposalPilot API Server                    ║
  ║  Running on http://localhost:${PORT}               ║
  ║  Model: Gemma 3 27B IT (open-weight)            ║
  ║  Status: ${process.env.GEMINI_API_KEY ? '✅ API Key configured' : '⚠️  Set GEMINI_API_KEY for AI generation'}      ║
  ╚══════════════════════════════════════════════════╝
  `);
});
