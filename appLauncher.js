import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common Known App Mappings
const KNOWN_APPS = {
  'notepad': 'notepad.exe',
  'calc': 'calc.exe',
  'calculator': 'calc.exe',
  'paint': 'mspaint.exe',
  'mspaint': 'mspaint.exe',
  'explorer': 'explorer.exe',
  'file explorer': 'explorer.exe',
  'my computer': 'explorer.exe',
  'taskmgr': 'taskmgr.exe',
  'task manager': 'taskmgr.exe',
  'powershell': 'powershell.exe',
  'cmd': 'cmd.exe',
  'command prompt': 'cmd.exe',
  'terminal': 'wt.exe',
  'windows terminal': 'wt.exe',
  'settings': 'ms-settings:',
  'snippingtool': 'snippingtool.exe',
  'snipping tool': 'snippingtool.exe',
  'chrome': 'chrome.exe',
  'google chrome': 'chrome.exe',
  'edge': 'msedge.exe',
  'microsoft edge': 'msedge.exe',
  'msedge': 'msedge.exe',
  'brave': 'brave.exe',
  'brave browser': 'brave.exe',
  'firefox': 'firefox.exe',
  'vscode': 'code',
  'code': 'code',
  'visual studio code': 'code',
  'antigravity': 'C:\\Users\\USER\\AppData\\Local\\Programs\\Antigravity IDE\\Antigravity IDE.exe',
  'antigravity ide': 'C:\\Users\\USER\\AppData\\Local\\Programs\\Antigravity IDE\\Antigravity IDE.exe',
  'cassandra': 'cmd.exe /c C:\\apache-cassandra-3.11.17\\bin\\cassandra.bat',
  'spotify': 'spotify:',
  'discord': 'discord:',
  'whatsapp': 'whatsapp:',
  'teams': 'msteams:',
  'microsoft teams': 'msteams:',
  'slack': 'slack:',
  'telegram': 'telegram:',
  'steam': 'steam:',
  'vlc': 'vlc.exe',
  'excel': 'excel.exe',
  'word': 'winword.exe',
  'ms word': 'winword.exe',
  'powerpoint': 'powerpnt.exe',
  'ppt': 'powerpnt.exe',
  'outlook': 'outlook.exe',
  'onenote': 'onenote:'
};

export function cleanAppName(input) {
  if (!input) return '';
  let cleaned = String(input).trim();
  cleaned = cleaned.replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:open|launch|start|run)\s+/i, '');
  cleaned = cleaned.replace(/\s+(?:app|application|software|program)$/i, '');
  cleaned = cleaned.replace(/^['"]|['"]$/g, '');
  return cleaned.trim();
}

/**
 * Launch any application on the user's system by name.
 */
export function launchApp(rawAppName) {
  return new Promise((resolve, reject) => {
    const appName = cleanAppName(rawAppName);
    if (!appName) {
      return reject(new Error('Application name is required.'));
    }

    const lower = appName.toLowerCase();
    const isWin = process.platform === 'win32';

    if (!isWin) {
      exec(`xdg-open "${appName}" || open "${appName}" || "${appName}"`, (err) => {
        if (err) return reject(new Error(`Failed to launch ${appName}: ${err.message}`));
        resolve({ success: true, app: appName });
      });
      return;
    }

    // Tier 1: Check known dictionary mapping
    const knownTarget = KNOWN_APPS[lower];
    if (knownTarget) {
      let cmd = '';
      if (knownTarget.endsWith(':')) {
        cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '${knownTarget}'"`;
      } else if (knownTarget.includes('\\') || knownTarget.includes('/')) {
        cmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '${knownTarget.replace(/'/g, "''")}'"`;
      } else {
        cmd = `cmd.exe /c start "" "${knownTarget}"`;
      }

      exec(cmd, { cwd: __dirname }, (err) => {
        if (!err) {
          return resolve({ success: true, app: appName, target: knownTarget, method: 'known_alias' });
        }
        tryStartAppsSearch(appName, resolve, reject);
      });
      return;
    }

    // Tier 2: Search Windows Start Apps via PowerShell
    tryStartAppsSearch(appName, resolve, reject);
  });
}

function tryStartAppsSearch(appName, resolve, reject) {
  const safeQuery = appName.replace(/'/g, "''");
  
  const psScript = `
  $q = '${safeQuery}'
  $app = Get-StartApps | Where-Object { $_.Name -like "*$q*" -or $_.AppID -like "*$q*" } | Select-Object -First 1
  if ($app) {
      Start-Process "shell:AppsFolder\\$($app.AppID)"
      Write-Host "FOUND:$($app.Name)"
  } else {
      $lnk = Get-ChildItem -Path "$env:ProgramData\\Microsoft\\Windows\\Start Menu\\Programs", "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs" -Recurse -Include *.lnk -ErrorAction SilentlyContinue | Where-Object { $_.BaseName -like "*$q*" } | Select-Object -First 1
      if ($lnk) {
          Start-Process "$($lnk.FullName)"
          Write-Host "LNK:$($lnk.Name)"
      } else {
          cmd.exe /c start "" "$q"
          Write-Host "CMD_START:$q"
      }
  }
  `;

  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  let resolved = false;
  const timeoutId = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      child.unref();
      resolve({ success: true, app: appName, method: 'start_apps_async' });
    }
  }, 1200);

  child.on('exit', (code) => {
    if (resolved) return;
    clearTimeout(timeoutId);
    resolved = true;

    if (code === 0 || stdout.includes('FOUND:') || stdout.includes('LNK:') || stdout.includes('CMD_START:')) {
      resolve({ success: true, app: appName, output: stdout.trim(), method: 'start_apps_search' });
    } else {
      exec(`cmd.exe /c start "" "${appName}"`, (err2) => {
        if (err2) {
          return reject(new Error(`Could not launch "${appName}". Ensure the app name is correct and installed.`));
        }
        resolve({ success: true, app: appName, method: 'cmd_fallback' });
      });
    }
  });
}
