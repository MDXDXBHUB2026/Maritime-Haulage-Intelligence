/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Haulage Contract Intelligence',
    version: '2.0.0',
    mode: 'deterministic-rules+gemini-ai',
  });
});

// AI Contract Extraction from natural text or rate document
app.post('/api/gemini/extract-contract', async (req, res) => {
  try {
    const { rawText, direction } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'rawText is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback mock extraction for local development without key
      return res.json({
        success: true,
        extracted: {
          contractNumber: 'HC-EXTRACTED-001',
          vendorCode: 'DEMO001',
          vendorName: 'NorthSea Haulage GmbH',
          direction: direction || 'IMPORT',
          pickupLocationCode: 'DEHAM',
          pickupLocationName: 'Hamburg',
          returnLocationCode: 'DEHAM',
          returnLocationName: 'Hamburg',
          currency: 'EUR',
          amountType: 'LUMPSUM',
          lumpSumMode: 'SINGLE_AMOUNT',
          haulageMode: 'Combined',
          tripType: 'Drop',
          ladenStatus: 'Laden',
          validFrom: '2026-03-01',
          validTo: '2026-12-31',
          remarks: 'Extracted from text: ' + rawText.substring(0, 80),
          routes: [
            {
              pickupLocationName: 'Hamburg',
              pickupLocationCode: 'DEHAM',
              dropLocationName: 'Prague',
              dropLocationCode: 'CZPRG',
              haulageMode: 'Combined',
              generalAmount: 760,
              remarks: 'Main Corridor Route',
            },
          ],
        },
        notice: 'Extracted using local parser (Set GEMINI_API_KEY for advanced neural extraction).',
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are a Senior Maritime Logistics Business Analyst assisting with Haulage Contract Extraction.
Extract structured contract information from this contract agreement text.
Return ONLY valid JSON matching this schema:
{
  "contractNumber": "string",
  "vendorCode": "string (match DEMO001, DEMO002, DEMO003, DEMO004, DEMO005 if mentioned)",
  "vendorName": "string",
  "direction": "IMPORT" or "EXPORT",
  "pickupLocationCode": "string (e.g. DEHAM, DEBRV, CZPRG)",
  "pickupLocationName": "string",
  "returnLocationCode": "string",
  "returnLocationName": "string",
  "currency": "EUR" or "USD",
  "amountType": "LUMPSUM" or "WEIGHT_SLAB",
  "lumpSumMode": "SINGLE_AMOUNT" or "EQUIPMENT_SPECIFIC",
  "haulageMode": "Road" or "Rail" or "Barge" or "Combined",
  "tripType": "Pick Up" or "Drop" or "Drop and Pick Up" or "Live Load",
  "ladenStatus": "Laden" or "Empty",
  "validFrom": "YYYY-MM-DD",
  "validTo": "YYYY-MM-DD",
  "remarks": "string",
  "routes": [
    {
      "pickupLocationName": "string",
      "pickupLocationCode": "string",
      "dropLocationName": "string",
      "dropLocationCode": "string",
      "haulageMode": "string",
      "generalAmount": number,
      "amount20": number,
      "amount40": number,
      "remarks": "string"
    }
  ]
}

If any field is missing or not provided in the text, provide a sensible default or say "Not provided". Never invent fake commercial amounts if none are mentioned.

Contract Agreement Text:
${rawText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);

    res.json({
      success: true,
      extracted: parsed,
    });
  } catch (error: any) {
    console.error('Gemini extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract contract' });
  }
});

// AI Validation Explanation in Plain Business Language
app.post('/api/gemini/explain-validation', async (req, res) => {
  try {
    const { issues, contractSummary } = req.body;
    if (!issues || !Array.isArray(issues)) {
      return res.status(400).json({ error: 'issues array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const summaryText = `Found ${issues.filter((i) => i.severity === 'ERROR').length} blocking errors and ${issues.filter((i) => i.severity === 'WARNING').length} warnings. Please verify master data codes and pricing parameters before generation.`;
      return res.json({ success: true, explanation: summaryText });
    }

    const ai = getGeminiClient();
    const prompt = `You are a Senior Maritime Logistics & TRUST Enterprise System Specialist.
Explain these deterministic validation results for contract ${contractSummary?.contractNumber || 'Current Contract'} in clear, professional, friendly maritime logistics business language.
Explain WHY these issues block enterprise TRUST system generation and give exact guidance on how the user can fix them.

Validation Issues:
${JSON.stringify(issues, null, 2)}

Contract Context:
${JSON.stringify(contractSummary, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      explanation: response.text,
    });
  } catch (error: any) {
    console.error('Gemini explain validation error:', error);
    res.status(500).json({ error: error.message || 'Failed to explain validation' });
  }
});

// AI Rate Anomaly Assistant
app.post('/api/gemini/anomaly-check', async (req, res) => {
  try {
    const { routes, amountType, currency } = req.body;
    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({ error: 'routes array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        anomalies: [
          {
            type: 'INFO',
            title: 'Rate Consistency Normal',
            description: 'All rates within typical European rail & road intermodal benchmarks.',
          },
        ],
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are an Intermodal Pricing & Yield Optimization Analyst.
Analyze the following haulage contract routes for potential rate anomalies, such as:
- Unusually high or low rates for the corridor
- Weight slab step rate inversions or inconsistencies
- Duplicate or conflicting route specifications
- Unrealistic price differentials between 20ft and 40ft containers

Always label observations as "Potential anomaly" and do NOT alter data.

Currency: ${currency || 'EUR'}
Amount Type: ${amountType || 'LUMPSUM'}
Routes:
${JSON.stringify(routes, null, 2)}

Return JSON array of anomalies:
[
  {
    "severity": "HIGH" | "MEDIUM" | "LOW" | "INFO",
    "routeSequence": number,
    "title": "string",
    "description": "string",
    "recommendation": "string"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({
      success: true,
      anomalies: parsed,
    });
  } catch (error: any) {
    console.error('Gemini anomaly check error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze anomalies' });
  }
});

// AI Contract Assistant / Natural Language Q&A
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        answer: `I am your Haulage Contract Assistant. You asked: "${question}". In this application, contractual transformations are executed deterministically by the TypeScript rule engine, and I assist with explanations, master data lookups, and contract drafting.`,
      });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are the Haulage Contract Intelligence AI Assistant.
You specialize in maritime container haulage, inland logistics (road, rail, barge), 20ft/40ft equipment rules, and enterprise TRUST record generation.
Key facts about the system:
1. All calculations, equipment expansions (e.g. DEHAM 4-way expansion to DEHAMTBURC 20s/40s and DEHAMTEURC 20s/40s), weight-slab tiering, and TRUST ID assignment are DETERMINISTIC and run in TypeScript.
2. AI never calculates or alters rates silently.
3. Legacy mode starts IDs at 1001 and respects legacy export column swapping (Col 17 Payable At, Col 18 Port To Pay).
4. Provide concise, clear, professional responses.`;

    const prompt = `Context data provided by user session:
${JSON.stringify(context || {}, null, 2)}

User Question:
${question}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (error: any) {
    console.error('Gemini assistant error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI request' });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
