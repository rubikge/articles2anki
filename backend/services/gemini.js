const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in the environment variables. Gemini term extraction will fail until configured.');
}

/**
 * Extracts technical terms and abbreviations from the provided text using Google Gemini API.
 * Provides definitions/explanations in Russian.
 * 
 * @param {string} text The content of the webpage/article to analyze
 * @returns {Promise<Array<{term: string, definition: string}>>} Array of terms and their definitions
 */
async function extractTerms(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables.');
  }

  if (apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.startsWith('MOCK')) {
    console.warn('[Gemini Service] Using mock term extraction because API key is set to a placeholder or MOCK.');
    if (!text || text.trim().length === 0) {
      return [];
    }
    if (text.toLowerCase().includes('fastify')) {
      return [
        { term: "Fastify", definition: "Быстрый и низкозатратный веб-фреймворк для Node.js." },
        { term: "Node.js", definition: "Программная платформа для выполнения JavaScript-кода на стороне сервера." },
        { term: "JSON schema", definition: "Стандарт описания структуры JSON-документов." },
        { term: "Pino", definition: "Высокопроизводительный логгер для Node.js приложений." }
      ];
    } else {
      return [
        { term: "Transformer", definition: "Архитектура нейронных сетей, основанная на механизме self-attention." },
        { term: "Self-attention", definition: "Механизм внимания, соотносящий различные позиции одной последовательности." },
        { term: "Multi-head attention", definition: "Расширение self-attention для параллельного анализа разных представлений." },
        { term: "Positional encoding", definition: "Метод добавления информации о последовательности токенов." },
        { term: "Feed-forward network", definition: "Полносвязная нейронная сеть, применяемая к каждому токену независимо." }
      ];
    }
  }

  if (!text || text.trim().length === 0) {
    console.warn('[Gemini Service] Received empty text, skipping extraction.');
    return [];
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `You are an expert technical editor and learning assistant. Analyze the provided text and extract technical terms, concepts, abbreviations, techniques, algorithms, methodologies, and tools mentioned.

CRITICAL INSTRUCTIONS:
1. All extracted term names and definitions MUST be in English.
2. Even if the source text is in Russian or another language, translate both the term name and its definition/explanation into English.
3. You MUST extract all major techniques, methodologies, and concepts discussed, especially those corresponding to the key subheadings or sections in the text. For example, if the text discusses RAG techniques, you MUST extract:
   - "HyDE" (Hypothetical Document Embedding)
   - "Relevant Segment Extraction" (RSE)
   - "Context Enrichment Window"
   - "Dartboard RAG"
   - and any other major RAG techniques, frameworks, and evaluation metrics discussed.
4. Each definition must be clear, concise, and explain what the term/concept represents in the context of the article.

Input Text to analyze:
${text}`;

  const schema = {
    type: "object",
    properties: {
      terms: {
        type: "array",
        items: {
          type: "object",
          properties: {
            term: { type: "string" },
            definition: { type: "string" }
          },
          required: ["term", "definition"]
        }
      }
    },
    required: ["terms"]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error('Invalid or empty response contents from Gemini API.');
    }

    const parsed = JSON.parse(candidateText);
    if (!parsed || !Array.isArray(parsed.terms)) {
      throw new Error('Gemini API response did not match the expected schema (missing "terms" array).');
    }

    return parsed.terms;
  } catch (error) {
    console.error('[Gemini Service] Error during term extraction:', error.message);
    throw error;
  }
}

module.exports = {
  extractTerms
};
