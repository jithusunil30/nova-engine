# PowerShell Script to Register N.O.V.A. Hotkey in Windows Start Menu & Desktop
$wshShell = New-Object -ComObject WScript.Shell
$targetPath = Join-Path $PSScriptRoot "Launch_NOVA.bat"

# Paths to register
$startMenuDir = [System.IO.Path]::Combine($env:APPDATA, "Microsoft\Windows\Start Menu\Programs")
$userDesktop = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$oneDriveDesktop = [System.IO.Path]::Combine($env:USERPROFILE, "OneDrive\Desktop")

$locations = @(
    (Join-Path $startMenuDir "N.O.V.A. AI.lnk"),
    (Join-Path $userDesktop "N.O.V.A. AI.lnk")
)

if (Test-Path $oneDriveDesktop) {
    $locations += (Join-Path $oneDriveDesktop "N.O.V.A. AI.lnk")
}

foreach ($shortcutPath in $locations) {
    try {
        $shortcut = $wshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $targetPath
        $shortcut.WorkingDirectory = $PSScriptRoot
        $shortcut.WindowStyle = 7 # Minimized
        $shortcut.Hotkey = "CTRL+ALT+N"
        $shortcut.Description = "Launch N.O.V.A. Autonomous AI System Core"
        $shortcut.Save()
        Write-Host "Registered shortcut at: $shortcutPath with Hotkey CTRL+ALT+N"
    } catch {
        Write-Host "Could not write shortcut"
    }
}

# Force Windows Shell to refresh hotkey registry index
$code = @"
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
[ShellRefresh]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host "Windows Shell notified. Hotkey Ctrl+Alt+N is now active."
