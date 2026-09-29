import fs from 'fs';
import path from 'path';

export const GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (Recommended - Ultra Fast)', isDefault: true },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (Balanced Intelligence)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Deep Reasoning)' }
];

export const TOOL_DECLARATIONS = [
  {
    function_declarations: [
      {
        name: 'execute_command',
        description: 'Executes a powershell/cmd command on the user local Windows workstation.',
        parameters: {
          type: 'OBJECT',
          properties: {
            command: { type: 'STRING', description: 'The exact shell command line string to run' }
          },
          required: ['command']
        }
      },
      {
        name: 'run_python',
        description: 'Executes a Python script snippet on the local machine using Python 3.13.',
        parameters: {
          type: 'OBJECT',
          properties: {
            code: { type: 'STRING', description: 'The Python code snippet to execute' }
          },
          required: ['code']
        }
      },
      {
        name: 'search_web',
        description: 'Searches Google and the web for live online intelligence and real-time updates.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'The search query string' }
          },
          required: ['query']
        }
      },
      {
        name: 'launch_app',
        description: 'Launches an application or executable (antigravity, cassandra, chrome, vscode, notepad, calc, powershell, explorer, etc.).',
        parameters: {
          type: 'OBJECT',
          properties: {
            app: { type: 'STRING', description: 'The application callsign or executable path' }
          },
          required: ['app']
        }
      },
      {
        name: 'cassandra_query',
        description: 'Executes a CQL query against the local Apache Cassandra 3.11 cluster on localhost:9042.',
        parameters: {
          type: 'OBJECT',
          properties: {
            cql: { type: 'STRING', description: 'The CQL query string (e.g. DESCRIBE KEYSPACES;)' }
          },
          required: ['cql']
        }
      },
      {
        name: 'write_file',
        description: 'Creates or updates a file in the user workspace with specified text content.',
        parameters: {
          type: 'OBJECT',
          properties: {
            filePath: { type: 'STRING', description: 'Absolute or workspace-relative path' },
            content: { type: 'STRING', description: 'The content to write into the file' }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'read_file',
        description: 'Reads content of a file from the workspace.',
        parameters: {
          type: 'OBJECT',
          properties: {
            filePath: { type: 'STRING', description: 'Absolute or relative file path' }
          },
          required: ['filePath']
        }
      },
      {
        name: 'take_screenshot',
        description: 'Captures a screenshot of the user primary display monitor.',
        parameters: {
          type: 'OBJECT',
          properties: {}
        }
      },
      {
        name: 'save_memory',
        description: 'Saves a persistent fact or user preference into N.O.V.A long-term memory matrix.',
        parameters: {
          type: 'OBJECT',
          properties: {
            fact: { type: 'STRING', description: 'The fact or directive to remember' },
            category: { type: 'STRING', description: 'Category (user_preference, directive, project, tools)' }
          },
          required: ['fact']
        }
      },
      {
        name: 'adjust_volume',
        description: 'Adjusts workstation audio volume (up, down, mute, unmute, or percentage 0-100).',
        parameters: {
          type: 'OBJECT',
          properties: {
            level: { type: 'STRING', description: 'Volume level or direction (e.g. "up", "down", "mute", "50")' }
          },
          required: ['level']
        }
      },
      {
        name: 'set_brightness',
        description: 'Adjusts laptop/monitor display brightness percentage (0 to 100).',
        parameters: {
          type: 'OBJECT',
          properties: {
            level: { type: 'NUMBER', description: 'Brightness level from 0 to 100' }
          },
          required: ['level']
        }
      },
      {
        name: 'get_hardware_status',
        description: 'Retrieves real-time Wi-Fi connection, signal quality, and battery charging percentage.',
        parameters: {
          type: 'OBJECT',
          properties: {}
        }
      },
      {
        name: 'organize_folder',
        description: 'Automatically cleans and organizes files in downloads or desktop into categorized folders (Documents, Images, Archives, Installers, Media, Code).',
        parameters: {
          type: 'OBJECT',
          properties: {
            target: { type: 'STRING', description: 'Folder to organize: "downloads", "desktop", or custom path' }
          },
          required: ['target']
        }
      },
      {
        name: 'find_recent_notes',
        description: 'Finds recently created or modified notes, documents, and scripts across Desktop and Documents.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Optional keyword or note topic' },
            daysBack: { type: 'NUMBER', description: 'Number of past days to scan (default 7)' }
          }
        }
      },
      {
        name: 'analyze_screen_vision',
        description: 'Takes a screenshot and interprets what is on the screen using AI multimodal vision.',
        parameters: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING', description: 'Specific question about what is on screen' }
          }
        }
      },
      {
        name: 'schedule_reminder',
        description: 'Sets a proactive background reminder that alerts the user after a specified number of minutes.',
        parameters: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Reminder message to alert user' },
            minutes: { type: 'NUMBER', description: 'Delay in minutes before alerting' }
          },
          required: ['text', 'minutes']
        }
      }
    ]
  }
];

export function resolveGeminiApiKey(preferences = {}) {
  if (preferences.geminiApiKey && preferences.geminiApiKey.trim().length > 5) {
    return preferences.geminiApiKey.trim();
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
    return process.env.GEMINI_API_KEY.trim();
  }
  return null;
}

export function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export async function testGeminiApiKey(apiKey, model = 'gemini-3.6-flash') {
  if (!apiKey || apiKey.trim().length < 5) {
    return { success: false, error: 'API key is required or too short.' };
  }
  
  const startTime = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
  
  const payload = {
    contents: [
      { parts: [{ text: 'N.O.V.A. system ping. Respond with OK.' }] }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status} error from Gemini API`;
      return { success: false, error: errMsg, durationMs };
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
    return {
      success: true,
      model,
      maskedKey: maskApiKey(apiKey),
      latencyMs: durationMs,
      sampleResponse: replyText.trim()
    };
  } catch (err) {
    return { success: false, error: err.message || 'Network connection error' };
  }
}

export async function runGeminiAgentTurn({ prompt, apiKey, model = 'gemini-3.6-flash', memoryData = {}, toolExecutors = {} }) {
  const steps = [];
  const userName = memoryData.preferences?.userName || 'Jithu';
  const memoriesList = (memoryData.memories || []).map(m => `- [${m.category}] ${m.fact}`).join('\n');

  const systemInstructionText = `You are N.O.V.A., an advanced autonomous AI system assistant for ${userName} (Lead Engineer & Architect).
Operating System: Windows 11 Workstation.
User Callsign: ${userName}.
Integrated Tooling & Workstation Stack:
- Antigravity IDE (Primary workspace & agent execution environment: C:\\Users\\USER\\AppData\\Local\\Programs\\Antigravity IDE)
- Apache Cassandra 3.11.17 (Cluster daemon on localhost:9042)
- Python 3.13 (Active runtime)
- Visual Studio Code & Google Chrome

User Long-Term Memory Matrix & Directives:
${memoriesList || 'No custom memories logged yet.'}

Instructions:
1. You have access to workstation tools (execute_command, run_python, search_web, launch_app, cassandra_query, read_file, write_file, take_screenshot, save_memory).
2. When the user asks to run commands, execute scripts, create files, check systems, search online, or query Cassandra, call the appropriate tool.
3. Be proactive, efficient, clear, and helpful. Format your responses using clean, attractive Markdown. Address the user as ${userName}.`;

  steps.push({
    phase: 'THOUGHT',
    message: `Gemini ${model} Engine Initialized. Context loaded: ${userName}, ${(memoryData.memories || []).length} long-term memories. Processing prompt: "${prompt}"`
  });

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];

  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const reqBody = {
      system_instruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents,
      tools: TOOL_DECLARATIONS
    };

    let resData;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      });

      resData = await res.json();
      if (!res.ok) {
        const errMsg = resData?.error?.message || `Gemini API HTTP Error ${res.status}`;
        steps.push({ phase: 'OBSERVATION', output: `Gemini API Error: ${errMsg}` });
        throw new Error(errMsg);
      }
    } catch (err) {
      return {
        steps,
        responseText: `⚠️ **Gemini API Error**: ${err.message}\n\nPlease check your Gemini API key or network connection.`,
        isGemini: true,
        error: err.message
      };
    }

    const candidate = resData?.candidates?.[0];
    const candidateContent = candidate?.content;

    if (!candidateContent || !candidateContent.parts || candidateContent.parts.length === 0) {
      steps.push({ phase: 'OBSERVATION', output: 'Empty response candidate from Gemini.' });
      return {
        steps,
        responseText: 'N.O.V.A. received an empty response candidate from Gemini.',
        isGemini: true
      };
    }

    // Push the model's response to conversation contents (maintaining thoughtSignature / parts format)
    contents.push(candidateContent);

    // Check if Gemini invoked a function tool call
    const functionCallPart = candidateContent.parts.find(p => p.functionCall);

    if (functionCallPart && functionCallPart.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      steps.push({
        phase: 'ACTION',
        tool: `gemini_tool_${name}`,
        input: args
      });

      // Execute local tool
      let toolOutput = '';
      try {
        if (toolExecutors[name]) {
          toolOutput = await toolExecutors[name](args);
        } else {
          toolOutput = `Tool '${name}' is not supported locally.`;
        }
      } catch (tErr) {
        toolOutput = `Execution error: ${tErr.message}`;
      }

      steps.push({
        phase: 'OBSERVATION',
        output: typeof toolOutput === 'string' ? toolOutput.slice(0, 2000) : JSON.stringify(toolOutput).slice(0, 2000)
      });

      // Send functionResponse back to Gemini for next turn
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name,
              response: {
                output: typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput)
              }
            }
          }
        ]
      });

      // Loop continues to get Gemini's follow-up synthesis
      continue;
    }

    // If Gemini returned text response
    const textPart = candidateContent.parts.find(p => p.text);
    if (textPart && textPart.text) {
      steps.push({
        phase: 'CONCLUSION',
        output: `Gemini ${model} synthesis complete.`
      });

      return {
        steps,
        responseText: textPart.text,
        isGemini: true,
        model
      };
    }

    // If no text and no function call
    break;
  }

  return {
    steps,
    responseText: `Gemini execution cycle ended after ${iterations} iterations.`,
    isGemini: true,
    model
  };
}
