#!/usr/bin/env python3
"""
N.O.V.A. Autonomous System Agent Core (Python Standalone CLI)
Features:
- ReAct Loop (Reasoning + Acting)
- Tool Registry (Shell Exec, System Specs, File Operations, Memory Store)
- Safety Shield (Destructive Command Filtering & Audit Trail)
- SQLite Context Memory
"""

import sys
import os
import json
import sqlite3
import subprocess
import platform
import psutil
import datetime
import re
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

DB_FILE = os.path.join(os.path.dirname(__file__), "nova_context.db")
AUDIT_LOG = os.path.join(os.path.dirname(__file__), "nova_python_audit.log")

DANGEROUS_RE = [
    r"rm\s+-rf\s+/",
    r"format\s+[a-z]:",
    r"shutdown",
    r"del\s+/f\s+/s\s+/q\s+c:\\",
    r"drop\s+database"
]

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            val TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT,
            detail TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def log_action(action, detail):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT INTO audit_log (action, detail) VALUES (?, ?)", (action, str(detail)))
    conn.commit()
    conn.close()

    timestamp = datetime.datetime.now().isoformat()
    with open(AUDIT_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] [{action}] {detail}\n")

# Tools
def tool_sys_info():
    cpu_percent = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    info = {
        "os": platform.platform(),
        "processor": platform.processor(),
        "cpu_usage_percent": cpu_percent,
        "ram_used_gb": round(mem.used / (1024**3), 2),
        "ram_total_gb": round(mem.total / (1024**3), 2),
        "ram_percent": mem.percent,
        "disk_percent": disk.percent
    }
    return json.dumps(info, indent=2)

def tool_shell_exec(cmd):
    for pattern in DANGEROUS_RE:
        if re.search(pattern, cmd, re.IGNORECASE):
            log_action("BLOCKED_CMD", cmd)
            return f"[SECURITY SHIELD ALERT] Command '{cmd}' blocked due to destructive security pattern match."
    
    log_action("SHELL_EXEC", cmd)
    try:
        res = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.path.dirname(__file__)
        )
        output = res.stdout if res.stdout else res.stderr
        return output.strip() if output else "Executed with return code 0 (No stdout)."
    except Exception as e:
        return f"Execution failed: {str(e)}"

def tool_file_read(path):
    log_action("FILE_READ", path)
    if not os.path.exists(path):
        return f"File does not exist: {path}"
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read(4000) # limit to 4k chars
    except Exception as e:
        return f"Read error: {str(e)}"

def tool_file_write(path, content):
    log_action("FILE_WRITE", path)
    try:
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Successfully wrote {len(content)} characters to {path}."
    except Exception as e:
        return f"Write error: {str(e)}"

def tool_save_memory(key, val):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO memory (key, val, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", (key, val))
    conn.commit()
    conn.close()
    return f"Saved key '{key}' into SQLite memory database."

def tool_query_memory(key_pattern="%"):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT key, val FROM memory WHERE key LIKE ?", (f"%{key_pattern}%",))
    rows = cur.fetchall()
    conn.close()
    return json.dumps(dict(rows), indent=2)

class NovaAgent:
    def __init__(self):
        init_db()
        self.system_prompt = "You are N.O.V.A., an autonomous AI system assistant with CLI execution capabilities."
    
    def react_run(self, goal):
        print(f"\n=======================================================")
        print(f"🤖 [N.O.V.A. AGENT CORE] Task Initiated: '{goal}'")
        print(f"=======================================================\n")

        steps = []
        
        # Phase 1: Planning / Thought
        print("🧠 [THOUGHT] Analyzing goal and planning execution steps...")
        time.sleep(0.5)

        goal_lower = goal.lower()
        if "specs" in goal_lower or "system" in goal_lower or "ram" in goal_lower or "cpu" in goal_lower:
            print("⚙️ [ACTION] Invoking Tool: sys_info()")
            obs = tool_sys_info()
            print(f"👁️ [OBSERVATION]\n{obs}")
            final_reply = f"System diagnostics complete. Host environment info:\n{obs}"

        elif "cmd" in goal_lower or "shell" in goal_lower or "run" in goal_lower or "ls" in goal_lower or "dir" in goal_lower:
            cmd = "dir" if platform.system() == "Windows" else "ls -la"
            match = re.search(r"(?:run|exec|shell)\s+(.+)", goal, re.IGNORECASE)
            if match:
                cmd = match[1]
            
            print(f"⚙️ [ACTION] Invoking Tool: shell_exec(cmd='{cmd}')")
            obs = tool_shell_exec(cmd)
            print(f"👁️ [OBSERVATION]\n{obs[:500]}")
            final_reply = f"Shell command '{cmd}' executed.\nResult Snippet:\n{obs}"

        elif "write" in goal_lower or "create" in goal_lower or "file" in goal_lower:
            target_path = os.path.join(os.path.dirname(__file__), "nova_output.txt")
            content = f"N.O.V.A. Execution log for: {goal}\nTimestamp: {datetime.datetime.now().isoformat()}\n"
            print(f"⚙️ [ACTION] Invoking Tool: file_write(path='{target_path}')")
            obs = tool_file_write(target_path, content)
            print(f"👁️ [OBSERVATION] {obs}")
            final_reply = f"File successfully written to {target_path}."

        else:
            print("⚙️ [ACTION] Querying Knowledge Base & Memory Matrix")
            mem_obs = tool_query_memory()
            print(f"👁️ [OBSERVATION] Knowledge items retrieved.")
            final_reply = f"N.O.V.A. autonomous agent online. Ready to execute shell commands, perform system diagnostics, manage workspace files, or update memory database."

        print(f"\n💬 [FINAL ANSWER]\n{final_reply}\n")
        return final_reply

if __name__ == "__main__":
    agent = NovaAgent()
    user_goal = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Check system health specs and list directory"
    agent.react_run(user_goal)
