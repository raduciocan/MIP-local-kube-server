# 00-prepare-windows-hosts.ps1
# Must be run as Administrator

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

$entries = @(
    @{ Line = "127.0.0.1 app.mip.localhost";   Pattern = '^\s*127\.0\.0\.1\s+app\.mip\.localhost\s*$' },
    @{ Line = "127.0.0.1 registry.localhost"; Pattern = '^\s*127\.0\.0\.1\s+registry\.localhost\s*$' }
)

# 1. Check for admin privileges
$windowsIdentity  = [Security.Principal.WindowsIdentity]::GetCurrent()
$windowsPrincipal = New-Object Security.Principal.WindowsPrincipal($windowsIdentity)
$isAdmin          = $windowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator. Right-click PowerShell and choose 'Run as administrator'."
    exit 1
}

# 2. Ensure hosts file exists
if (-not (Test-Path $hostsPath)) {
    Write-Error "Hosts file not found at $hostsPath"
    exit 1
}

# 3. Load hosts content once
$hostsContent = Get-Content -Path $hostsPath -ErrorAction Stop

foreach ($e in $entries) {
    $line    = $e.Line
    $pattern = $e.Pattern

    if ($hostsContent -match $pattern) {
        Write-Host "Entry already present in hosts file: $line"
    } else {
        Write-Host "Adding entry to hosts file: $line"
        Add-Content -Path $hostsPath -Value $line
    }
}

Write-Host "Done."
