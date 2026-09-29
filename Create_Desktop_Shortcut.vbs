Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strTargetDir = WshShell.CurrentDirectory

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\N.O.V.A. AI.lnk")
oShellLink.TargetPath = strTargetDir & "\Launch_NOVA.bat"
oShellLink.WorkingDirectory = strTargetDir
oShellLink.WindowStyle = 7 ' Minimized window
oShellLink.Hotkey = "CTRL+ALT+N"
oShellLink.Description = "Launch N.O.V.A. Autonomous AI System Core"
oShellLink.Save

WScript.Echo "Shortcut successfully created on your Desktop with hotkey Ctrl+Alt+N!"
