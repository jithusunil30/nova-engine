import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Active Reminders Queue for Proactive Agent Tasks
const activeReminders = [];
let wsBroadcastCallback = null;

export function registerBroadcastCallback(fn) {
  wsBroadcastCallback = fn;
}

// -----------------------------------------------------------------------------------
// 1. AUDIO & VOLUME SYSTEM CONTROL
// -----------------------------------------------------------------------------------
export async function adjustVolume(directionOrLevel) {
  return new Promise((resolve) => {
    let script = '';
    const lower = String(directionOrLevel).toLowerCase();

    if (lower === 'mute' || lower === 'unmute') {
      script = `(New-Object -ComObject WScript.Shell).SendKeys([char]173)`;
    } else if (lower === 'up' || lower.includes('increase')) {
      script = `1..5 | ForEach-Object { (New-Object -ComObject WScript.Shell).SendKeys([char]175); Start-Sleep -Milliseconds 50 }`;
    } else if (lower === 'down' || lower.includes('decrease') || lower.includes('lower')) {
      script = `1..5 | ForEach-Object { (New-Object -ComObject WScript.Shell).SendKeys([char]174); Start-Sleep -Milliseconds 50 }`;
    } else {
      const numMatch = lower.match(/\b([0-9]{1,3})\b/);
      const targetPercent = numMatch ? Math.min(100, Math.max(0, parseInt(numMatch[1], 10))) : 50;
      // Send 50 volume downs then volume ups to approximate target
      const stepsUp = Math.round(targetPercent / 2);
      script = `
1..50 | ForEach-Object { (New-Object -ComObject WScript.Shell).SendKeys([char]174) }
1..${stepsUp} | ForEach-Object { (New-Object -ComObject WScript.Shell).SendKeys([char]175) }
`;
    }

    exec(`powershell -Command "${script.replace(/\r?\n/g, '; ')}"`, (err) => {
      if (err) return resolve({ success: false, error: err.message });
      resolve({ success: true, message: `Volume adjustment (${directionOrLevel}) executed.` });
    });
  });
}

// -----------------------------------------------------------------------------------
// 2. DISPLAY & BRIGHTNESS SYSTEM CONTROL
// -----------------------------------------------------------------------------------
export async function getBrightness() {
  return new Promise((resolve) => {
    const cmd = `powershell -Command "Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightness -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CurrentBrightness"`;
    exec(cmd, (err, stdout) => {
      const val = stdout ? parseInt(stdout.trim(), 10) : null;
      resolve({ brightness: isNaN(val) ? null : val });
    });
  });
}

export async function setBrightness(level) {
  return new Promise((resolve) => {
    const num = Math.min(100, Math.max(0, parseInt(level, 10) || 50));
    const cmd = `powershell -Command "(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods -ErrorAction SilentlyContinue).WmiSetBrightness(1, ${num})"`;
    exec(cmd, (err) => {
      if (err) return resolve({ success: false, error: err.message });
      resolve({ success: true, brightness: num, message: `Display brightness set to ${num}%.` });
    });
  });
}

// -----------------------------------------------------------------------------------
// 3. HARDWARE TELEMETRY: WI-FI & BATTERY
// -----------------------------------------------------------------------------------
export async function getHardwareStatus() {
  return new Promise((resolve) => {
    const psScript = `
$wifi = netsh wlan show interfaces | Select-String 'State|SSID|Signal' | Out-String
$bat = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object EstimatedChargeRemaining, BatteryStatus | ConvertTo-Json -Compress
[PSCustomObject]@{
    Wifi = $wifi.Trim()
    Battery = $bat
} | ConvertTo-Json
`;
    exec(`powershell -Command "${psScript.replace(/\r?\n/g, ' ')}"`, (err, stdout) => {
      try {
        const parsed = JSON.parse(stdout || '{}');
        let batteryObj = null;
        if (parsed.Battery) {
          try { batteryObj = JSON.parse(parsed.Battery); } catch(e){}
        }
        resolve({
          wifiRaw: parsed.Wifi || 'Wi-Fi interface offline or not connected',
          battery: batteryObj ? {
            percent: batteryObj.EstimatedChargeRemaining,
            isCharging: batteryObj.BatteryStatus === 2
          } : null
        });
      } catch (e) {
        resolve({ wifiRaw: 'Unknown', battery: null });
      }
    });
  });
}

// -----------------------------------------------------------------------------------
// 4. INTELLIGENT FILE ORGANIZER & CLEANUP ("Clean up my downloads")
// -----------------------------------------------------------------------------------
const FILE_CATEGORIES = {
  Documents: ['.pdf', '.docx', '.doc', '.xlsx', '.pptx', '.txt', '.csv', '.rtf'],
  Images: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'],
  Installers: ['.exe', '.msi', '.bat', '.cmd'],
  Archives: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  Media: ['.mp4', '.mkv', '.avi', '.mov', '.mp3', '.wav', '.flac'],
  Code: ['.py', '.js', '.ts', '.cql', '.sql', '.html', '.css', '.json', '.java', '.cpp', '.c']
};

export function resolveUserFolderPath(target = 'downloads') {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\USER';
  const name = target.toLowerCase().trim();

  if (name === 'desktop') {
    const oneDriveDesktop = path.join(userProfile, 'OneDrive', 'Desktop');
    if (fs.existsSync(oneDriveDesktop)) return oneDriveDesktop;
    return path.join(userProfile, 'Desktop');
  }
  if (name === 'downloads') {
    const oneDriveDownloads = path.join(userProfile, 'OneDrive', 'Downloads');
    if (fs.existsSync(oneDriveDownloads)) return oneDriveDownloads;
    return path.join(userProfile, 'Downloads');
  }
  if (name === 'documents') {
    const oneDriveDocs = path.join(userProfile, 'OneDrive', 'Documents');
    if (fs.existsSync(oneDriveDocs)) return oneDriveDocs;
    return path.join(userProfile, 'Documents');
  }
  if (path.isAbsolute(target)) return target;
  return path.join(userProfile, target);
}

export async function organizeFolder(target = 'downloads', dryRun = false) {
  const targetPath = resolveUserFolderPath(target);

  if (!fs.existsSync(targetPath)) {
    return { success: false, error: `Directory '${targetPath}' does not exist.` };
  }

  const items = fs.readdirSync(targetPath);
  const moves = [];

  for (const item of items) {
    const fullPath = path.join(targetPath, item);
    const stat = fs.statSync(fullPath);

    // Skip directories
    if (stat.isDirectory()) continue;

    const ext = path.extname(item).toLowerCase();
    let matchedCategory = 'Other';

    for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
      if (extensions.includes(ext)) {
        matchedCategory = category;
        break;
      }
    }

    if (matchedCategory !== 'Other') {
      const destDir = path.join(targetPath, matchedCategory);
      const destPath = path.join(destDir, item);

      moves.push({
        file: item,
        from: fullPath,
        to: destPath,
        category: matchedCategory
      });

      if (!dryRun) {
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        // Handle name collision
        let finalDest = destPath;
        if (fs.existsSync(finalDest)) {
          const namePart = path.basename(item, ext);
          finalDest = path.join(destDir, `${namePart}_${Date.now()}${ext}`);
        }
        fs.renameSync(fullPath, finalDest);
      }
    }
  }

  return {
    success: true,
    folder: targetPath,
    totalOrganized: moves.length,
    dryRun,
    summary: moves.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {})
  };
}

// -----------------------------------------------------------------------------------
// 5. SEARCH RECENT NOTES & FILES ("Open yesterday's notes")
// -----------------------------------------------------------------------------------
export async function findRecentNotes(query = '', daysBack = 7) {
  const searchRoots = [
    resolveUserFolderPath('desktop'),
    resolveUserFolderPath('documents'),
    resolveUserFolderPath('downloads'),
    __dirname
  ];

  const results = [];
  const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const noteExtensions = ['.txt', '.md', '.docx', '.cql', '.sql', '.py', '.json'];

  function scanDir(dir, depth = 0) {
    if (depth > 2) return;
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules' || file === 'dist') continue;
        const fullPath = path.join(dir, file);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDir(fullPath, depth + 1);
          } else {
            const ext = path.extname(file).toLowerCase();
            if (noteExtensions.includes(ext) && stat.mtimeMs >= cutoffTime) {
              const matchesQuery = !query || file.toLowerCase().includes(query.toLowerCase());
              if (matchesQuery) {
                results.push({
                  name: file,
                  path: fullPath,
                  modified: new Date(stat.mtimeMs).toISOString(),
                  sizeBytes: stat.size
                });
              }
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  for (const root of searchRoots) {
    if (fs.existsSync(root)) scanDir(root, 0);
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  return results.slice(0, 10);
}

// -----------------------------------------------------------------------------------
// 6. MULTIMODAL PERCEPTION: SCREENSHOT & GEMINI VISION ANALYSIS
// -----------------------------------------------------------------------------------
export async function captureAndAnalyzeScreen(question = 'What application or code is active on screen?', apiKey = null) {
  const screenshotDir = path.join(__dirname, 'public', 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const targetFile = path.join(screenshotDir, 'screen.png');

  // Capture screen using PowerShell
  const psScript = `
Add-Type -AssemblyName System.Windows.Forms,System.Drawing
$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen(0, 0, 0, 0, $b.Size)
$bmp.Save('${targetFile.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
`;

  await new Promise((resolve) => exec(psScript, { shell: 'powershell.exe' }, resolve));

  if (!fs.existsSync(targetFile)) {
    return { success: false, error: 'Screenshot capture failed.' };
  }

  const keyToUse = apiKey || process.env.GEMINI_API_KEY;
  if (!keyToUse) {
    return {
      success: true,
      screenshotUrl: '/screenshots/screen.png',
      analysis: 'Screenshot captured. Configure GEMINI_API_KEY for automatic vision interpretation.'
    };
  }

  try {
    const imgBuffer = fs.readFileSync(targetFile);
    const b64 = imgBuffer.toString('base64');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${keyToUse.trim()}`;

    const payload = {
      contents: [{
        parts: [
          { text: `You are N.O.V.A.'s vision perception module. Analyze this workstation screenshot and answer: ${question}` },
          { inline_data: { mime_type: 'image/png', data: b64 } }
        ]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No description returned.';

    return {
      success: true,
      screenshotUrl: '/screenshots/screen.png',
      analysis: replyText.trim()
    };
  } catch (err) {
    return {
      success: false,
      screenshotUrl: '/screenshots/screen.png',
      error: `Vision interpretation failed: ${err.message}`
    };
  }
}

// -----------------------------------------------------------------------------------
// 7. PROACTIVE AGENT SCHEDULER & BACKGROUND REMINDERS
// -----------------------------------------------------------------------------------
export function scheduleReminder(text, minutes = 1) {
  const id = `rem-${Date.now()}`;
  const fireTime = Date.now() + (minutes * 60 * 1000);

  const timer = setTimeout(() => {
    // Notify via console and WebSocket
    console.log(`\n🔔 [PROACTIVE REMINDER]: ${text}\n`);
    if (wsBroadcastCallback) {
      wsBroadcastCallback({
        type: 'PROACTIVE_ALERT',
        title: 'N.O.V.A. Scheduled Reminder',
        message: text,
        timestamp: new Date().toISOString()
      });
    }

    // Remove from active list
    const idx = activeReminders.findIndex(r => r.id === id);
    if (idx !== -1) activeReminders.splice(idx, 1);
  }, minutes * 60 * 1000);

  const entry = {
    id,
    text,
    fireTime: new Date(fireTime).toISOString(),
    timer
  };
  activeReminders.push(entry);

  return { id, text, delayMinutes: minutes, fireTime: entry.fireTime };
}

export function getActiveReminders() {
  return activeReminders.map(r => ({ id: r.id, text: r.text, fireTime: r.fireTime }));
}
