param([ValidateRange(1024, 65535)][int]$Port = 5501)
$ErrorActionPreference = 'Stop'
$projectDirectory = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$bundledPython = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
if (Test-Path -LiteralPath $bundledPython) { $pythonExecutable = $bundledPython }
else {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if (-not $pythonCommand) { throw 'Python 3 is required to serve this static site.' }
    $pythonExecutable = $pythonCommand.Source
}
Push-Location -LiteralPath $projectDirectory
try {
    Write-Host "Portfolio: http://127.0.0.1:$Port/"
    Write-Host "Admin: http://127.0.0.1:$Port/portal_fady_9x2k.html"
    & $pythonExecutable -m http.server $Port --bind 127.0.0.1
} finally { Pop-Location }
