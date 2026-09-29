import { testGeminiApiKey, runGeminiAgentTurn, resolveGeminiApiKey, GEMINI_MODELS } from './geminiService.js';

export const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini (Gemini 3.5 Flash Lite / 3.8 Flash)', requiresKey: true },
  { id: 'groq', name: 'Groq Cloud (OpenAI GPT-OSS 120B / Qwen 3.8 - Ultra Fast & Free)', requiresKey: true },
  { id: 'openai', name: 'OpenAI / OpenRouter (GPT-4o / DeepSeek)', requiresKey: true },
  { id: 'ollama', name: 'Ollama Local LLM (100% Offline / Free)', requiresKey: false },
  { id: 'native', name: 'N.O.V.A. Autonomous ReAct Engine (Offline)', requiresKey: false }
];

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B (High Intelligence & Code)', isDefault: true },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (High Speed & Code Reasoning)' },
  { id: 'openai/gpt-oss-20b', name: 'OpenAI GPT-OSS 20B (Lightweight & Ultra Fast)' }
];

export function resolveAiConfig(preferences = {}) {
  const provider = preferences.aiProvider || 'auto'; // 'auto', 'gemini', 'groq', 'openai', 'ollama', 'native'
  const geminiKey = preferences.geminiApiKey || process.env.GEMINI_API_KEY || '';
  const groqKey = preferences.groqApiKey || process.env.GROQ_API_KEY || '';
  const openAiKey = preferences.openAiApiKey || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || '';
  const ollamaHost = preferences.ollamaHost || 'http://localhost:11434';

  return {
    provider,
    geminiKey: geminiKey.trim(),
    geminiModel: preferences.geminiModel || 'gemini-3.5-flash-lite',
    groqKey: groqKey.trim(),
    groqModel: preferences.groqModel || 'openai/gpt-oss-120b',
    openAiKey: openAiKey.trim(),
    openAiModel: preferences.openAiModel || 'gpt-4o-mini',
    ollamaHost,
    ollamaModel: preferences.ollamaModel || 'llama3.2'
  };
}

export async function testGroqApiKey(apiKey, model = 'openai/gpt-oss-120b') {
  if (!apiKey || apiKey.trim().length < 5) {
    return { success: false, error: 'Groq API Key is required.' };
  }
  const startTime = Date.now();
  const modelsToTry = [model, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  const uniqueModels = [...new Set(modelsToTry)];

  for (const m of uniqueModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: 'Ping. Reply OK.' }],
          max_tokens: 15
        })
      });
      const data = await res.json();
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        const text = data?.choices?.[0]?.message?.content || 'OK';
        return { success: true, model: m, latencyMs: durationMs, sampleResponse: text.trim() };
      }
    } catch (e) {
      // Continue next model
    }
  }
  return { success: false, error: 'All tested Groq models failed.' };
}

export async function testOllama(host = 'http://localhost:11434') {
  try {
    const res = await fetch(`${host}/api/tags`);
    if (!res.ok) return { success: false, error: 'Ollama is offline or unreachable' };
    const data = await res.json();
    return { success: true, models: data.models || [] };
  } catch (e) {
    return { success: false, error: 'Ollama daemon is not running on localhost:11434' };
  }
}

export async function runGroqAgentTurn({ prompt, apiKey, model = 'openai/gpt-oss-120b', memoryData = {}, toolExecutors = {} }) {
  const steps = [];
  const userName = memoryData.preferences?.userName || 'Jithu';
  const memoriesList = (memoryData.memories || []).map(m => `- [${m.category}] ${m.fact}`).join('\n');

  const modelsToTry = [model, 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  const uniqueModels = [...new Set(modelsToTry)];
  let activeModel = uniqueModels[0];

  steps.push({
    phase: 'THOUGHT',
    message: `Groq Cloud AI Engine (${activeModel}) Initialized. User: ${userName}. Directing prompt: "${prompt}"`
  });

  const systemMessage = `You are N.O.V.A., an advanced autonomous AI workstation assistant for ${userName}.
Operating System: Windows 11 Workstation.
User Stack: Antigravity IDE, Apache Cassandra 3.11, Python 3.13, VS Code, Chrome.
User Memories:
${memoriesList || 'No custom memories logged.'}

Answer directives concisely, professionally, and accurately using formatted Markdown. When asked for code, provide clean, idiomatic, fully explained implementations.`;

  for (const curModel of uniqueModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: curModel,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 2500
        })
      });

      const data = await res.json();
      if (res.ok) {
        const reply = data?.choices?.[0]?.message?.content || '';
        steps.push({ phase: 'CONCLUSION', output: `Groq ${curModel} synthesis complete.` });
        return {
          steps,
          responseText: reply,
          isGroq: true,
          model: curModel
        };
      }
    } catch (err) {
      // Continue next model
    }
  }

  throw new Error('All available Groq models failed or were unreachable.');
}

export async function runUnifiedAgentTurn({ prompt, memoryData = {}, toolExecutors = {} }) {
  const config = resolveAiConfig(memoryData.preferences);
  const steps = [];

  // 1. Try Gemini API if Key Available
  if (config.geminiKey && (config.provider === 'auto' || config.provider === 'gemini')) {
    try {
      const result = await runGeminiAgentTurn({
        prompt,
        apiKey: config.geminiKey,
        model: config.geminiModel,
        memoryData,
        toolExecutors
      });

      // If Gemini returned a valid non-error response
      if (!result.error && result.responseText && !result.responseText.includes('Gemini API Error')) {
        return result;
      }
      steps.push({ phase: 'OBSERVATION', output: `Gemini API primary failed: ${result.error || 'Rate limit / Error'}. Activating fallback provider.` });
    } catch (gErr) {
      steps.push({ phase: 'OBSERVATION', output: `Gemini API error: ${gErr.message}. Activating fallback provider.` });
    }
  }

  // 2. Try Groq API if Key Available
  if (config.groqKey && (config.provider === 'auto' || config.provider === 'groq')) {
    try {
      const groqRes = await runGroqAgentTurn({
        prompt,
        apiKey: config.groqKey,
        model: config.groqModel,
        memoryData,
        toolExecutors
      });
      return groqRes;
    } catch (grErr) {
      steps.push({ phase: 'OBSERVATION', output: `Groq API fallback failed: ${grErr.message}.` });
    }
  }

  // 3. Fallback to N.O.V.A. Native ReAct Engine (100% Reliable Offline Execution)
  steps.push({
    phase: 'THOUGHT',
    message: `Activating N.O.V.A. Autonomous ReAct Engine (Offline Resilient Execution Mode).`
  });

  return null; // Signals server.js to use native heuristic ReAct loop
}
