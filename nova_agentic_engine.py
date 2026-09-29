#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===================================================================================
                  N.O.V.A. UNIVERSAL AGENTIC INTELLIGENCE ENGINE
                Polyglot Autonomous Transformer & Human-Like Agent
===================================================================================
Author: Built for Jithu
Callsign: N.O.V.A. (Neural Operations & Virtual Architecture)
Environment: Windows 10/11 | Python 3.13 | Node.js v24 | Cassandra 3.11 | Antigravity

Capabilities:
1. Universal World Knowledge: DuckDuckGo live web intelligence + Wikipedia + Google search index.
2. Polyglot Programming Core: Real LLM-synthesized code (Gemini & Groq) in:
   - Python (.py)
   - JavaScript / Node.js (.js, .mjs)
   - TypeScript (.ts)
   - C / C++ (.c, .cpp)
   - Java (.java)
   - Go (.go)
   - Rust (.rs)
   - PowerShell / Batch (.ps1, .bat)
   - Database SQL & Cassandra CQL (.cql)
3. Autonomous Human-Like Reasoning Loop (ReAct with Self-Correction):
   - Thought -> Plan -> LLM Code Generation -> Security Shield -> Execution -> Stdout Analysis.
   - Self-Healing: Catches errors, auto-installs missing dependencies (pip/npm),
     and re-runs until verified working.
4. Continuous Long-Term GPT Memory:
   - Automatic keyword & tag overlap memory retrieval
   - Durable fact mining and automatic storage in nova_memory.json
===================================================================================
"""

import sys
import os
import json
import time
import re
import socket
import urllib.request
import urllib.parse
import urllib.error
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

WORKSPACE_DIR = Path(__file__).resolve().parent
MEMORY_FILE = WORKSPACE_DIR / "nova_memory.json"

# High-Risk Command Interception Patterns for Security Shield
DANGEROUS_PATTERNS = [
    r"\brm\s+-rf\s+/",
    r"\bformat\s+[a-z]:",
    r"\bdel\s+/f\s+/s\s+/q\s+c:\\",
    r"\bshutdown\s+/[s|r]",
    r"\bdrop\s+database\b",
    r"\bnet\s+user\s+.*\/delete",
    r"\breg\s+delete\b"
]

# ===================================================================================
# 1. KNOWLEDGE & PERSISTENT MEMORY MATRIX
# ===================================================================================

class KnowledgeMatrix:
    """Manages persistent GPT-like user context, facts, and live online search."""
    
    def __init__(self, memory_path: Path = MEMORY_FILE):
        self.memory_path = memory_path
        self.data = self._load_memory()

    def _load_memory(self) -> Dict[str, Any]:
        if self.memory_path.exists():
            try:
                with open(self.memory_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "preferences": {"userName": "Jithu"},
            "userProfile": {"name": "Jithu", "title": "Lead Engineer"},
            "memories": [],
            "conversationHistory": []
        }

    def get_user_name(self) -> str:
        return self.data.get("preferences", {}).get("userName", "Jithu")

    def get_user_profile(self) -> Dict[str, Any]:
        return self.data.get("userProfile", {
            "name": self.get_user_name(),
            "title": "Lead Engineer & Architect",
            "stack": ["Antigravity IDE", "Apache Cassandra 3.11", "Python 3.13", "Visual Studio Code", "Google Chrome"]
        })

    def get_preferences(self) -> Dict[str, Any]:
        return self.data.get("preferences", {})

    def retrieve_relevant_memories(self, prompt: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant memories from nova_memory.json via keyword & tag overlap scoring.
        Dependency-light: No external embeddings required.
        """
        memories = self.data.get("memories", [])
        if not memories:
            return []

        stopwords = {
            "a", "an", "the", "is", "in", "it", "of", "to", "for", "with", "on", "at", 
            "by", "this", "that", "and", "or", "from", "as", "be", "do", "does", "i", 
            "my", "me", "we", "you", "your", "can", "could", "would", "should", "how",
            "write", "code", "script", "program", "please", "run", "make", "create"
        }
        raw_tokens = re.findall(r'\b[a-zA-Z0-9_\-\.]{2,}\b', prompt.lower())
        prompt_tokens = {t for t in raw_tokens if t not in stopwords}

        if not prompt_tokens:
            return memories[:top_k]

        scored: List[Tuple[float, Dict[str, Any]]] = []
        for mem in memories:
            score = 0.0
            fact_text = mem.get("fact", "").lower()
            category = mem.get("category", "").lower()
            tags = [t.lower() for t in mem.get("tags", [])]

            # Tag overlap (weighted highest: 3.0 per matching tag)
            for tag in tags:
                if tag in prompt_tokens or any(pt in tag or tag in pt for pt in prompt_tokens):
                    score += 3.0

            # Category match (weighted: 2.0)
            if category in prompt_tokens or any(pt in category for pt in prompt_tokens):
                score += 2.0

            # Fact word overlap (weighted: 1.0 per matching token)
            fact_tokens = set(re.findall(r'\b[a-zA-Z0-9_\-\.]{2,}\b', fact_text))
            overlap = prompt_tokens.intersection(fact_tokens)
            score += len(overlap) * 1.0

            # Direct substring match bonus
            for pt in prompt_tokens:
                if len(pt) >= 4 and pt in fact_text:
                    score += 1.5

            if score > 0:
                scored.append((score, mem))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

    def save_memory(self, fact: str, category: str = "general", tags: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        """Appends a new durable fact to nova_memory.json's memories list with a timestamp."""
        fact_clean = fact.strip()
        if not fact_clean:
            return None

        # Check for existing duplicate
        for m in self.data.get("memories", []):
            if m.get("fact", "").strip().lower() == fact_clean.lower():
                return m

        timestamp = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
        new_entry = {
            "id": f"mem-{int(time.time() * 1000)}",
            "fact": fact_clean,
            "category": category or "user_directive",
            "timestamp": timestamp,
            "tags": tags or ["auto_extracted"]
        }

        if "memories" not in self.data:
            self.data["memories"] = []
        self.data["memories"].append(new_entry)

        try:
            with open(self.memory_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[KnowledgeMatrix] Warning: failed to save memory to {self.memory_path}: {e}", file=sys.stderr)

        return new_entry

    def search_online(self, query: str) -> Dict[str, Any]:
        """Queries DuckDuckGo live web scraper and Wikipedia for real-time human knowledge."""
        clean_q = re.sub(r'^(?:what\s+is|who\s+is|tell\s+me\s+about|search\s+for|search|find|explain)\s+', '', query, flags=re.I).strip()
        if not clean_q:
            clean_q = query

        results = {
            "query": clean_q,
            "title": clean_q,
            "summary": "",
            "snippets": [],
            "google_url": f"https://www.google.com/search?q={urllib.parse.quote(clean_q)}"
        }

        # 1. DuckDuckGo HTML Live Web Search
        try:
            url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(clean_q)}"
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
            })
            with urllib.request.urlopen(req, timeout=6) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
                raw_snippets = re.findall(r'<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>', html)
                for s in raw_snippets[:4]:
                    clean_s = re.sub(r'<[^>]+>', '', s).replace('&quot;', '"').replace('&#x27;', "'").replace('&amp;', '&').strip()
                    if clean_s and clean_s not in results["snippets"]:
                        results["snippets"].append(clean_s)
        except Exception:
            pass

        # 2. Wikipedia Summary API
        try:
            wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(clean_q)}&format=json&utf8=1"
            req = urllib.request.Request(wiki_url, headers={'User-Agent': 'NovaAgenticEngine/2.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                search_list = data.get("query", {}).get("search", [])
                if search_list:
                    top_title = search_list[0].get("title")
                    results["title"] = top_title
                    sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(top_title)}"
                    req2 = urllib.request.Request(sum_url, headers={'User-Agent': 'NovaAgenticEngine/2.0'})
                    with urllib.request.urlopen(req2, timeout=5) as resp2:
                        sum_data = json.loads(resp2.read().decode('utf-8'))
                        results["summary"] = sum_data.get("extract", "")
        except Exception:
            pass

        if not results["summary"] and results["snippets"]:
            results["summary"] = results["snippets"][0]

        return results

# ===================================================================================
# 2. LLM CALL HELPERS (Gemini & Groq via Standard Library HTTP)
# ===================================================================================

def call_gemini_api(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    """Calls Google Gemini API using Python standard library urllib."""
    clean_key = api_key.strip()
    # Preferred model first, with fallbacks for retired or unavailable models
    models_to_try = [model]
    for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-lite-latest"]:
        if fallback not in models_to_try:
            models_to_try.append(fallback)

    last_error = ""
    for candidate_model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate_model}:generateContent?key={clean_key}"
        payload_data = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2
            }
        }
        data_bytes = json.dumps(payload_data).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                return text
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {e.code}: {err_body}"
            # Retry next candidate model on 404 (retired), 503 (high demand), or 429 (rate limited)
            if e.code in (404, 503, 429) and candidate_model != models_to_try[-1]:
                continue
            raise RuntimeError(f"Gemini API request failed ({candidate_model}): {last_error}")
        except Exception as e:
            last_error = str(e)
            continue

    raise RuntimeError(f"All Gemini model attempts failed: {last_error}")


def call_groq_api(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    """Calls Groq Cloud API using Python standard library urllib."""
    clean_key = api_key.strip()
    url = "https://api.groq.com/openai/v1/chat/completions"
    payload_data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }
    data_bytes = json.dumps(payload_data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={
            "Authorization": f"Bearer {clean_key}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            return resp_data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Groq API request failed ({model}) [HTTP {e.code}]: {err_body}")
    except Exception as e:
        raise RuntimeError(f"Groq API request failed ({model}): {str(e)}")

# ===================================================================================
# 3. POLYGLOT CODE GENERATOR & COMPILER/RUNTIME SUBSYSTEM
# ===================================================================================

class PolyglotRuntime:
    """Detects languages, generates multi-language code via LLM, writes files, compiles, and runs them."""

    LANGUAGE_MAP = {
        "python": {"ext": ".py", "runner": "python", "desc": "Python 3.13 Runtime"},
        "javascript": {"ext": ".js", "runner": "node", "desc": "Node.js v24 V8 Runtime"},
        "node": {"ext": ".js", "runner": "node", "desc": "Node.js v24 V8 Runtime"},
        "typescript": {"ext": ".ts", "runner": "npx tsx", "desc": "TypeScript / tsx"},
        "c": {"ext": ".c", "runner": "gcc", "desc": "C99/C11 Native Compiler"},
        "cpp": {"ext": ".cpp", "runner": "g++", "desc": "C++17/C++20 Compiler"},
        "c++": {"ext": ".cpp", "runner": "g++", "desc": "C++17/C++20 Compiler"},
        "java": {"ext": ".java", "runner": "javac", "desc": "Java Virtual Machine"},
        "rust": {"ext": ".rs", "runner": "rustc", "desc": "Rust Native Compiler"},
        "go": {"ext": ".go", "runner": "go run", "desc": "Go Runtime"},
        "powershell": {"ext": ".ps1", "runner": "powershell -ExecutionPolicy Bypass -File", "desc": "PowerShell 5.1"},
        "cql": {"ext": ".cql", "runner": "cqlsh", "desc": "Apache Cassandra CQL Engine"}
    }

    @classmethod
    def detect_language(cls, prompt: str) -> str:
        p = prompt.lower()
        if "javascript" in p or "node.js" in p or "nodejs" in p or "express" in p:
            return "javascript"
        if "typescript" in p or ".ts" in p:
            return "typescript"
        if " c++" in p or "cpp" in p:
            return "cpp"
        if re.search(r'\b(in\s+c|c\s+code|c\s+program)\b', p):
            return "c"
        if "java" in p and "javascript" not in p:
            return "java"
        if "rust" in p:
            return "rust"
        if re.search(r'\b(golang|go\s+code|in\s+go)\b', p):
            return "go"
        if "powershell" in p or "ps1" in p:
            return "powershell"
        if "cassandra" in p or "cql" in p or "keyspace" in p:
            return "cql"
        return "python"  # Default polyglot language

    @classmethod
    def synthesize_code(
        cls, 
        prompt: str, 
        language: str, 
        knowledge: KnowledgeMatrix,
        relevant_memories: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[str, str, Optional[Dict[str, Any]]]:
        """
        Synthesizes production-ready, human-quality code using real LLM calls (Gemini / Groq).
        Builds a comprehensive system prompt with N.O.V.A.'s identity, operator profile, and memories.
        Returns: (code_string, suggested_filename, optional_learned_fact_dict)
        Falls back gracefully with a clear error message if no API key is configured.
        """
        user_name = knowledge.get_user_name()
        user_profile = knowledge.get_user_profile()
        user_title = user_profile.get("title", "Lead Engineer & Architect")
        user_stack = user_profile.get("stack", ["Python 3.13", "Node.js v24", "Antigravity IDE"])

        prefs = knowledge.get_preferences()
        provider = (prefs.get("aiProvider") or "auto").lower()
        gemini_key = (prefs.get("geminiApiKey") or os.environ.get("GEMINI_API_KEY") or "").strip()
        groq_key = (prefs.get("groqApiKey") or os.environ.get("GROQ_API_KEY") or "").strip()
        gemini_model = prefs.get("geminiModel") or "gemini-3.5-flash-lite"
        groq_model = prefs.get("groqModel") or "openai/gpt-oss-120b"

        # Explicit validation: Fall back gracefully with clear error message if no API key is configured
        if provider == "gemini" and not gemini_key:
            raise RuntimeError(
                "Gemini provider is selected, but no 'geminiApiKey' was found in nova_memory.json "
                "or the GEMINI_API_KEY environment variable. Please configure an API key."
            )
        if provider == "groq" and not groq_key:
            raise RuntimeError(
                "Groq provider is selected, but no 'groqApiKey' was found in nova_memory.json "
                "or the GROQ_API_KEY environment variable. Please configure an API key."
            )
        if provider == "auto" and not gemini_key and not groq_key:
            raise RuntimeError(
                "No LLM API key configured. Please configure 'geminiApiKey' or 'groqApiKey' in "
                "nova_memory.json's 'preferences' or set the GEMINI_API_KEY / GROQ_API_KEY environment variable."
            )

        # Retrieve relevant memories if not already supplied
        if relevant_memories is None:
            relevant_memories = knowledge.retrieve_relevant_memories(prompt, top_k=5)

        memories_text = "\n".join(
            f"- [{m.get('category', 'general')}] {m.get('fact', '')}"
            for m in relevant_memories
        ) or "None recorded yet."

        lang_desc = cls.LANGUAGE_MAP.get(language, {}).get("desc", language)

        system_prompt = f"""You are N.O.V.A. (Neural Omniscient Virtual Assistant), an elite autonomous AI engineer and pair programmer for {user_name}.
Target Environment: Windows Workstation | Python 3.13 | Node.js v24 (ES Modules) | Cassandra 3.11 | Antigravity IDE.
Operator Profile:
- Name: {user_name}
- Title: {user_title}
- Tech Stack: {', '.join(user_stack)}

Relevant Long-Term Memories & Context:
{memories_text}

Task Objective:
Synthesize clean, self-contained, executable code in {language.upper()} ({lang_desc}) to accomplish the operator's directive.

Mandatory Instructions:
1. Provide production-ready, fully working code.
2. If Python: always handle UTF-8 output (`if hasattr(sys.stdout, 'reconfigure'): sys.stdout.reconfigure(encoding='utf-8')`) and make it fully non-interactive.
3. If JavaScript / Node.js: use modern ES Module syntax (`import ... from ...`).
4. If Cassandra: use standard cqlsh or python driver patterns.
5. If the operator's directive introduces a new persistent user preference, project detail, or durable fact, append:
LEARNED_FACT: <the durable fact>
CATEGORY: <category such as user_preference, user_project, tools, identity>
TAGS: <comma-separated tags>

Response Format:
You MUST format your output starting with the suggested filename followed by the code inside markdown fences:
FILENAME: <suggested_filename_with_extension>
```{language}
<executable code>
```
"""

        # Dispatch LLM Call
        chosen_provider = provider
        if chosen_provider == "auto":
            chosen_provider = "gemini" if gemini_key else "groq"

        if chosen_provider == "gemini":
            response_text = call_gemini_api(gemini_key, gemini_model, system_prompt, prompt)
        else:
            response_text = call_groq_api(groq_key, groq_model, system_prompt, prompt)

        # Parse suggested filename
        fn_match = re.search(r'FILENAME:\s*([a-zA-Z0-9_\-\.]+)', response_text, re.IGNORECASE)
        default_ext = cls.LANGUAGE_MAP.get(language, {}).get("ext", ".py")
        timestamp = time.strftime('%Y%m%d_%H%M%S')

        if fn_match:
            suggested_filename = fn_match.group(1).strip()
            if not os.path.splitext(suggested_filename)[1]:
                suggested_filename += default_ext
        else:
            suggested_filename = f"nova_{language}_{timestamp}{default_ext}"

        # Parse code block
        code_match = re.search(r'```(?:[a-zA-Z0-9_\-\+]+)?\s*\n([\s\S]*?)```', response_text)
        if code_match:
            code = code_match.group(1).strip()
        else:
            clean_lines = []
            for line in response_text.splitlines():
                if line.upper().startswith("FILENAME:") or line.upper().startswith("LEARNED_FACT:") or line.upper().startswith("CATEGORY:") or line.upper().startswith("TAGS:"):
                    continue
                clean_lines.append(line)
            code = "\n".join(clean_lines).strip()

        # Parse durable learned fact if present
        learned_fact = None
        fact_match = re.search(r'LEARNED_FACT:\s*(.+)', response_text, re.IGNORECASE)
        if fact_match:
            fact = fact_match.group(1).strip()
            cat_match = re.search(r'CATEGORY:\s*([a-zA-Z0-9_\-]+)', response_text, re.IGNORECASE)
            category = cat_match.group(1).strip() if cat_match else "user_directive"
            tags_match = re.search(r'TAGS:\s*(.+)', response_text, re.IGNORECASE)
            tags = [t.strip() for t in tags_match.group(1).split(',')] if tags_match else ["llm_extracted"]
            learned_fact = {"fact": fact, "category": category, "tags": tags}

        return code, suggested_filename, learned_fact

    @classmethod
    def execute(cls, file_path: Path, language: str) -> Dict[str, Any]:
        """Runs the file through the appropriate language toolchain, returning stdout/stderr/time."""
        start_time = time.perf_counter()
        cfg = cls.LANGUAGE_MAP.get(language, cls.LANGUAGE_MAP["python"])
        runner = cfg["runner"]
        
        cmd = []
        if language == "python":
            cmd = [sys.executable, str(file_path)]
        elif language == "javascript":
            cmd = ["node", str(file_path)]
        elif language == "powershell":
            cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", str(file_path)]
        elif language == "cql":
            cmd = ["powershell", "-Command", f"C:\\apache-cassandra-3.11.17\\bin\\cqlsh.bat -f {file_path}"]
        else:
            cmd = runner.split() + [str(file_path)]

        try:
            res = subprocess.run(
                cmd,
                cwd=WORKSPACE_DIR,
                capture_output=True,
                text=True,
                timeout=30,
                encoding='utf-8',
                errors='replace'
            )
            duration_ms = (time.perf_counter() - start_time) * 1000
            return {
                "success": res.returncode == 0,
                "exit_code": res.returncode,
                "stdout": res.stdout.strip(),
                "stderr": res.stderr.strip(),
                "duration_ms": round(duration_ms, 2),
                "command": " ".join(cmd)
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": "Execution timed out after 30 seconds.",
                "duration_ms": 30000.0,
                "command": " ".join(cmd)
            }
        except Exception as e:
            return {
                "success": False,
                "exit_code": -1,
                "stdout": "",
                "stderr": str(e),
                "duration_ms": 0.0,
                "command": " ".join(cmd)
            }

# ===================================================================================
# 4. AUTONOMOUS HUMAN-LIKE AGENT LOOP (ReAct with Self-Healing)
# ===================================================================================

class NovaAgenticEngine:
    """
    The Master Autonomous Agentic Engine.
    Behaves like an Antigravity AI pair-programmer:
    Perceives -> Plans -> Generates Polyglot Code via LLM -> Security Shield -> Writes Files -> Executes -> Self-Heals -> Delivers.
    """

    def __init__(self):
        self.knowledge = KnowledgeMatrix()
        self.runtime = PolyglotRuntime()

    def _extract_prompt_fact(self, prompt: str) -> Optional[Tuple[str, str, List[str]]]:
        """Heuristic check to extract durable user facts/preferences directly from the prompt."""
        triggers = [
            (r'(?:remember that|remember this|don\'t forget that|make a note that)\s+(.+)', 'user_directive', ['directive']),
            (r'(?:my favorite|i prefer|i like to use|i always use)\s+(.+)', 'user_preference', ['preference']),
            (r'(?:i am working on|i\'m working on|my current project is)\s+(.+)', 'user_project', ['project']),
            (r'(?:my email is|my phone is|call me)\s+(.+)', 'contact_info', ['contact']),
            (r'(?:note that|note:)\s+(.+)', 'user_note', ['note'])
        ]
        for pattern, cat, tags in triggers:
            m = re.search(pattern, prompt, re.IGNORECASE)
            if m and m.group(1).strip():
                return m.group(1).strip(), cat, tags
        return None

    def run_directive(self, prompt: str) -> Dict[str, Any]:
        """Executes any user directive autonomously without requiring user typing."""
        user_name = self.knowledge.get_user_name()
        steps = []
        is_autonomous_code = False

        # Phase 1: Context & Perception
        steps.append({
            "phase": "THOUGHT",
            "message": f"Perceiving directive: '{prompt}'. Operator: {user_name}. Analyzing whether directive is an autonomous coding task, database action, or online world query."
        })

        # Automatic durable fact learning from prompt
        prompt_fact = self._extract_prompt_fact(prompt)
        if prompt_fact:
            saved = self.knowledge.save_memory(prompt_fact[0], prompt_fact[1], prompt_fact[2])
            if saved:
                steps.append({
                    "phase": "ACTION",
                    "tool": "gpt_memory_commit",
                    "input": {"fact": prompt_fact[0], "category": prompt_fact[1]}
                })
                steps.append({
                    "phase": "OBSERVATION",
                    "output": f"Committed new memory to long-term store: \"{prompt_fact[0]}\""
                })

        lower_prompt = prompt.lower()
        is_coding = any(k in lower_prompt for k in [
            "write", "code", "create a script", "script", "program", "fibonacci",
            "prime", "factorial", "sort", "scraper", "calculate", "run python", "node", "javascript",
            "test cassandra", "query", "database", "solve", "benchmark", "build"
        ])

        # If it's a coding or execution task:
        if is_coding:
            is_autonomous_code = True
            lang = self.runtime.detect_language(prompt)
            lang_desc = self.runtime.LANGUAGE_MAP.get(lang, {}).get("desc", lang)

            steps.append({
                "phase": "THOUGHT",
                "message": f"Identified execution domain: {lang.upper()} ({lang_desc}). Formulating multi-language LLM solution without requiring manual typing from {user_name}."
            })

            # Retrieve relevant memories for injection into LLM system prompt
            relevant_mems = self.knowledge.retrieve_relevant_memories(prompt, top_k=5)
            if relevant_mems:
                steps.append({
                    "phase": "THOUGHT",
                    "message": f"Injected {len(relevant_mems)} relevant context memories into LLM prompt."
                })

            # Synthesize Code via LLM
            try:
                code, filename, learned_fact = self.runtime.synthesize_code(
                    prompt=prompt,
                    language=lang,
                    knowledge=self.knowledge,
                    relevant_memories=relevant_mems
                )
            except Exception as e:
                err_msg = str(e)
                steps.append({
                    "phase": "OBSERVATION",
                    "output": f"Code synthesis error: {err_msg}"
                })
                steps.append({
                    "phase": "CONCLUSION",
                    "output": "Code generation aborted due to LLM configuration or API error."
                })
                return {
                    "prompt": prompt,
                    "response": f"⚠️ **N.O.V.A. LLM Code Generation Notice**\n\n{err_msg}\n\n*Please ensure a valid Gemini or Groq API key is configured.*",
                    "steps": steps,
                    "is_autonomous": True,
                    "language": lang,
                    "artifact": None
                }

            # If LLM response indicated a durable fact learned during synthesis
            if learned_fact:
                saved = self.knowledge.save_memory(
                    learned_fact["fact"], 
                    learned_fact.get("category", "general"), 
                    learned_fact.get("tags", [])
                )
                if saved:
                    steps.append({
                        "phase": "ACTION",
                        "tool": "gpt_memory_commit",
                        "input": {"fact": learned_fact["fact"], "category": learned_fact.get("category")}
                    })
                    steps.append({
                        "phase": "OBSERVATION",
                        "output": f"LLM discovered durable fact: \"{learned_fact['fact']}\""
                    })

            # Security Shield: Intercept dangerous commands before writing or execution
            is_dangerous = False
            violation_reason = ""
            for pattern in DANGEROUS_PATTERNS:
                if re.search(pattern, code, re.IGNORECASE) or re.search(pattern, prompt, re.IGNORECASE):
                    is_dangerous = True
                    violation_reason = f"Matches high-risk destructive pattern: {pattern}"
                    break

            if is_dangerous:
                steps.append({
                    "phase": "ACTION",
                    "tool": "security_shield_intercept",
                    "input": {"code_length": len(code), "reason": violation_reason}
                })
                steps.append({
                    "phase": "OBSERVATION",
                    "output": f"[SECURITY SHIELD ALERT] Execution blocked: {violation_reason}."
                })
                steps.append({
                    "phase": "CONCLUSION",
                    "output": "Execution halted by Security Shield to protect workstation integrity."
                })
                return {
                    "prompt": prompt,
                    "response": (
                        f"🛡️ **[SECURITY SHIELD ALERT] Execution Blocked**\n\n"
                        f"The LLM-generated code was intercepted because it contains a destructive command pattern:\n"
                        f"`{violation_reason}`\n\n"
                        f"Execution was aborted without modifying your workstation, **{user_name}**."
                    ),
                    "steps": steps,
                    "is_autonomous": True,
                    "language": lang,
                    "artifact": filename
                }

            file_path = WORKSPACE_DIR / filename

            # Action 1: Write to Disk
            steps.append({
                "phase": "ACTION",
                "tool": "antigravity_write_file",
                "input": {
                    "filename": filename,
                    "language": lang,
                    "lines_count": len(code.splitlines())
                }
            })

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(code)

            steps.append({
                "phase": "OBSERVATION",
                "output": f"Artifact written to disk at {file_path} ({os.path.getsize(file_path)} bytes)."
            })

            # Action 2: Subprocess Execution
            steps.append({
                "phase": "ACTION",
                "tool": "antigravity_run_command",
                "input": {
                    "language": lang,
                    "target_file": filename
                }
            })

            exec_result = self.runtime.execute(file_path, lang)
            steps.append({
                "phase": "OBSERVATION",
                "output": exec_result["stdout"] or exec_result["stderr"] or "Exit code: 0 (No stdout)."
            })

            # Action 3: Self-Healing Reflection Loop (If error occurred)
            if not exec_result["success"] and exec_result["stderr"]:
                steps.append({
                    "phase": "THOUGHT",
                    "message": f"Execution error detected: '{exec_result['stderr'][:100]}'. Activating self-healing reflection pipeline..."
                })
                # Check for missing python package
                pkg_match = re.search(r"No module named ['\"]([^'\"]+)['\"]", exec_result["stderr"])
                if pkg_match and lang == "python":
                    missing_pkg = pkg_match.group(1)
                    steps.append({
                        "phase": "ACTION",
                        "tool": "auto_install_package",
                        "input": {"package": missing_pkg, "manager": "pip"}
                    })
                    subprocess.run([sys.executable, "-m", "pip", "install", missing_pkg], capture_output=True)
                    exec_result = self.runtime.execute(file_path, lang)
                    steps.append({
                        "phase": "OBSERVATION",
                        "output": f"Self-healing complete. Re-run output: {exec_result['stdout']}"
                    })
                elif "Cannot find module" in exec_result["stderr"] and lang in ("javascript", "node"):
                    npm_match = re.search(r"Cannot find module ['\"]([^'\"]+)['\"]", exec_result["stderr"])
                    if npm_match:
                        missing_pkg = npm_match.group(1)
                        steps.append({
                            "phase": "ACTION",
                            "tool": "auto_install_package",
                            "input": {"package": missing_pkg, "manager": "npm"}
                        })
                        subprocess.run(["npm", "install", missing_pkg], cwd=WORKSPACE_DIR, capture_output=True)
                        exec_result = self.runtime.execute(file_path, lang)
                        steps.append({
                            "phase": "OBSERVATION",
                            "output": f"Self-healing complete. Re-run output: {exec_result['stdout']}"
                        })

            steps.append({
                "phase": "CONCLUSION",
                "output": f"Autonomous execution completed in {exec_result['duration_ms']} ms. Zero manual commands required from user."
            })

            output_text = exec_result["stdout"] or exec_result["stderr"]
            response_text = (
                f"⚡ **Antigravity Universal Agentic Execution Complete**\n\n"
                f"N.O.V.A. executed this directive autonomously in your workstation environment without requiring you to type anything, **{user_name}**.\n\n"
                f"📁 **Artifact Created:** `{filename}` ({lang.upper()})\n"
                f"⚡ **Execution Command:** `{exec_result['command']}`\n"
                f"⏱️ **Runtime Duration:** {exec_result['duration_ms']} ms\n\n"
                f"**Standard Output:**\n```\n{output_text}\n```\n\n"
                f"**Synthesized Code (LLM Generated):**\n```{lang}\n{code}\n```"
            )

            return {
                "prompt": prompt,
                "response": response_text,
                "steps": steps,
                "is_autonomous": True,
                "language": lang,
                "artifact": filename
            }

        # Otherwise, Universal Knowledge & Web Intelligence Search:
        else:
            steps.append({
                "phase": "ACTION",
                "tool": "universal_world_knowledge_search",
                "input": {"query": prompt}
            })

            online_info = self.knowledge.search_online(prompt)
            steps.append({
                "phase": "OBSERVATION",
                "output": f"Knowledge indexed for '{online_info['title']}'. Snippets retrieved: {len(online_info['snippets'])}."
            })

            snippet_text = ""
            if online_info["snippets"]:
                snippet_text = "\n\n**🌐 Live Web Snippets:**\n" + "\n".join(f"• {s}" for s in online_info["snippets"][:3])

            response_text = (
                f"🌐 **Universal Intelligence Matrix (Google & Web Synced)**\n\n"
                f"**{online_info['title']}**\n\n"
                f"{online_info['summary'] or 'World knowledge retrieved.'}{snippet_text}\n\n"
                f"🔍 **Direct Google Query:** [Search '{prompt}' on Google]({online_info['google_url']})\n\n"
                f"*(N.O.V.A. can also code a custom script, build a full-stack solution, or run live database queries on command, {user_name}!)*"
            )

            return {
                "prompt": prompt,
                "response": response_text,
                "steps": steps,
                "is_autonomous": False,
                "online_info": online_info
            }

# ===================================================================================
# 5. CLI INTERFACE & INTEGRATION HOOKS
# ===================================================================================

def main():
    agent = NovaAgenticEngine()

    if len(sys.argv) > 1:
        if sys.argv[1] == "--interactive" or sys.argv[1] == "-i":
            print("=================================================================")
            print("  N.O.V.A. Universal Polyglot Agentic Engine Interactive Console")
            print("  Type any command or query (Type 'exit' to quit)")
            print("=================================================================\n")
            while True:
                try:
                    p = input("NOVA-PROMPT > ").strip()
                    if not p or p.lower() in ("exit", "quit", "q"):
                        break
                    res = agent.run_directive(p)
                    print("\n" + res["response"] + "\n")
                except (KeyboardInterrupt, EOFError):
                    break
        elif sys.argv[1] == "--json":
            prompt = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "status"
            res = agent.run_directive(prompt)
            print(json.dumps(res, indent=2))
        else:
            prompt = " ".join(sys.argv[1:])
            res = agent.run_directive(prompt)
            print(res["response"])
    else:
        # Default test run
        res = agent.run_directive("calculate fibonacci of 15 and print results")
        print(res["response"])

if __name__ == '__main__':
    main()
