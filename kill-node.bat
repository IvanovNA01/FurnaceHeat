taskkill /im node.exe /F || echo process "node.exe" not running.
timeout 1 > nul
taskkill /im dotnet.exe /F || echo process "dotnet.exe" not running.
