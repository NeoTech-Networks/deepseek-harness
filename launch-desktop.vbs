Set ws = CreateObject("WScript.Shell")
ws.Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""C:\Projects\repos\deepseek-harness\launch-desktop.ps1""", 0, False
