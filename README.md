# N.O.V.A. — Universal Polyglot AI Agentic Engine
> **Neural Omniscient Virtual Assistant (N.O.V.A.)**  
> An autonomous agentic AI engine with transformer-inspired reasoning, real-time world knowledge retrieval, polyglot self-healing code execution, and an immersive pitch-black & fluorescent white Web HUD.

---

## ⚡ Overview

**N.O.V.A.** is designed to act autonomously like a human engineer—perceiving complex operator directives, searching real-time online sources, synthesizing clean code in any programming language, running the code locally, diagnosing runtime outputs, and self-healing bugs without requiring manual typing.

### Key Capabilities
- 🧠 **Transformer ReAct Reasoning**: Autonomous multi-step cycle (`THOUGHT` ➔ `ACTION` ➔ `OBSERVATION` ➔ `SELF-HEAL` ➔ `CONCLUSION`).
- 🌐 **Omniscient World Knowledge Matrix**: Live DuckDuckGo scraping, Wikipedia REST API integration, and Google search queries.
- 💻 **Polyglot Autonomous Code Runtime**:
  - **Python 3.13**: NumPy, SciPy, custom scripts, data pipelines.
  - **Node.js v24 (ES Modules)**: Modern JavaScript and TypeScript runtime.
  - **C / C++ & Rust**: Native systems programming and compilation.
  - **Java & Go**: Enterprise microservices and concurrency.
  - **PowerShell**: Windows systems administration and process orchestration.
  - **Apache Cassandra 3.11**: CQL queries, nodetool diagnostics, and cluster health.
- 🎨 **Fluorescent HUD & Voice Interface**: Pure pitch black (`#000000`) and glowing fluorescent white (`#ffffff`) holographic radar core, audio visualizers, and speech synthesis.
- 💾 **Continuous GPT Memory**: Automatically extracts and persists user preferences, projects, and directives across restarts.

---

## 🚀 Architecture

```
                                  ┌───────────────────────────┐
                                  │      JITHU (OPERATOR)     │
                                  └─────────────┬─────────────┘
                                                │ Directives
                                                ▼
                        ┌───────────────────────────────────────────────┐
                        │     N.O.V.A. Transduction Reasoning Core      │
                        │    (Perception • Attention • Planning)        │
                        └───────┬───────────────┬───────────────┬───────┘
                                │               │               │
        ┌───────────────────────┴─┐   ┌─────────┴─────────┐   ┌─┴────────────────────────┐
        │  World Knowledge Matrix │   │  Polyglot Runtime │   │   Long-Term GPT Memory   │
        │ • DuckDuckGo Web Index  │   │ • Python 3.13     │   │ • User Profile & Stacks  │
        │ • Wikipedia REST API    │   │ • Node.js v24 ESM │   │ • Automatic Fact Mining  │
        │ • Google Query Links    │   │ • C / C++ / Rust  │   │ • Directive History      │
        │ • System OS Diagnostics │   │ • Go / PowerShell │   │ • Persistent JSON Store  │
        └─────────────────────────┘   │ • Cassandra CQL   │   └──────────────────────────┘
                                      └─────────┬─────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │ Autonomous Self-Healing Loop    │
                               │  THOUGHT ──► WRITE_FILE         │
                               │      ▲           │              │
                               │      │           ▼              │
                               │  HEAL ERROR ◄── RUN_COMMAND     │
                               │                  │              │
                               │                  ▼              │
                               │             CONCLUSION          │
                               └─────────────────────────────────┘
```

---

## 🛠️ Quick Start

### 1. Installation
Clone the repository and install frontend and backend dependencies:
```bash
git clone https://github.com/jithusunil30/nova-engine.git
cd nova-engine
npm install
```

### 2. Configuration
Copy the template memory file:
```bash
cp nova_memory.example.json nova_memory.json
```
*(Optional: Add your Gemini or Groq API keys in `nova_memory.json` or configure via the in-app HUD modal).*

### 3. Launching N.O.V.A.
Start the backend agent daemon and Vite dev server:
```bash
# Terminal 1: Backend Agent Server (Port 3001)
node server.js

# Terminal 2: Web HUD Frontend (Port 3000)
npm run dev
```

Open `http://localhost:3000` to interact with the N.O.V.A. interface.

---

## 🖥️ Command-Line Interface (CLI)

N.O.V.A. can also be run entirely headlessly from Python:

```bash
# Interactive REPL session
python nova_agentic_engine.py --interactive

# Single directive execution
python nova_agentic_engine.py "write a node.js script to benchmark memory"

# Structured JSON output for API pipelines
python nova_agentic_engine.py --json "search online for quantum teleportation"
```

---

## 📡 API Endpoints

- `POST /api/agent/chat`: Full ReAct planning loop with autonomous code execution and speech integration.
- `POST /api/agent/universal`: Direct access to the universal polyglot transformer engine.
- `GET /api/system/status`: Real-time CPU, RAM, and hardware telemetry.
- `GET /api/memory`: Current knowledge base and extracted user directives.
- `POST /api/ai/config`: Multi-provider LLM credentials and routing switcher.

---

## 🛡️ Security & Sandboxing
- High-risk shell commands (e.g. partition formatting, system deletion) are intercepted and blocked by the Security Shield.
- Sensitive environment variables and API keys are isolated from version control.

---

## 👤 Author
- **Architect & Lead Engineer**: Jithu S ([@jithusunil30](https://github.com/jithusunil30))
- **AI Callsign**: N.O.V.A. (Neural Omniscient Virtual Assistant)
- **License**: MIT
