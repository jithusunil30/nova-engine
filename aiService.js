import { testGeminiApiKey, runGeminiAgentTurn, resolveGeminiApiKey, GEMINI_MODELS } from './geminiService.js';

export const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini (Gemini 3.6 / 2.5 Flash)', requiresKey: true },
  { id: 'groq', name: 'Groq Cloud (Llama 3.3 70B - Ultra Fast & Free)', requiresKey: true },
  { id: 'openai', name: 'OpenAI / OpenRouter (GPT-4o / DeepSeek)', requiresKey: true },
  { id: 'ollama', name: 'Ollama Local LLM (100% Offline / Free)', requiresKey: false },
  { id: 'native', name: 'N.O.V.A. Autonomous ReAct Engine (Offline)', requiresKey: false }
];

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended)' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Reasoning)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Fast Context)' }
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
    geminiModel: preferences.geminiModel || 'gemini-3.6-flash',
    groqKey: groqKey.trim(),
    groqModel: preferences.groqModel || 'llama-3.3-70b-versatile',
    openAiKey: openAiKey.trim(),
    openAiModel: preferences.openAiModel || 'gpt-4o-mini',
    ollamaHost,
    ollamaModel: preferences.ollamaModel || 'llama3.2'
  };
}

export async function testGroqApiKey(apiKey, model = 'llama-3.3-70b-versatile') {
  if (!apiKey || apiKey.trim().length < 5) {
    return { success: false, error: 'Groq API Key is required.' };
  }
  const startTime = Date.now();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping. Reply OK.' }],
        max_tokens: 15
      })
    });
    const data = await res.json();
    const durationMs = Date.now() - startTime;
    if (!res.ok) {
      return { success: false, error: data?.error?.message || `Groq API Error ${res.status}` };
    }
    const text = data?.choices?.[0]?.message?.content || 'OK';
    return { success: true, model, latencyMs: durationMs, sampleResponse: text.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
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

export async function runGroqAgentTurn({ prompt, apiKey, model, memoryData, toolExecutors }) {
  const steps = [];
  const userName = memoryData.preferences?.userName || 'Jithu';
  const memoriesList = (memoryData.memories || []).map(m => `- [${m.category}] ${m.fact}`).join('\n');

  steps.push({
    phase: 'THOUGHT',
    message: `Groq Cloud AI Engine (${model}) Initialized. User: ${userName}. Directing prompt: "${prompt}"`
  });

  const systemMessage = `You are N.O.V.A., an advanced autonomous AI workstation assistant for ${userName}.
Operating System: Windows 11 Workstation.
User Stack: Antigravity IDE, Apache Cassandra 3.11, Python 3.13, VS Code, Chrome.
User Memories:
${memoriesList || 'No custom memories logged.'}

Answer directives concisely, professionally, and accurately using formatted Markdown.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);

    const reply = data?.choices?.[0]?.message?.content || '';
    steps.push({ phase: 'CONCLUSION', output: `Groq ${model} synthesis complete.` });

    return {
      steps,
      responseText: reply,
      isGroq: true,
      model
    };
  } catch (err) {
    throw err;
  }
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
