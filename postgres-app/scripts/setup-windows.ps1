Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Resolve-ToolPath {
    param(
        [Parameter(Mandatory = $true)][string]$ToolName,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $existing = Get-Command $ToolName -ErrorAction SilentlyContinue
    if ($existing) {
        return $existing.Source
    }

    $candidates = Get-ChildItem -Path $Pattern -ErrorAction SilentlyContinue | Sort-Object FullName -Descending
    if ($candidates -and $candidates.Count -gt 0) {
        return $candidates[0].FullName
    }

    return $null
}

function Invoke-Tool {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter()][string[]]$Arguments = @()
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $FilePath $($Arguments -join ' ')"
    }
}

function ConvertFrom-SecureStringToPlainText {
    param([System.Security.SecureString]$SecureString)

    if (-not $SecureString) {
        return ''
    }

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Get-DotEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    $escapedKey = [regex]::Escape($Key)
    foreach ($line in Get-Content $Path) {
        if ($line -match "^\s*$escapedKey=(.*)$") {
            return $Matches[1]
        }
    }

    return $null
}

function Set-DotEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $line = "$Key=$Value"
    if (-not (Test-Path $Path)) {
        Set-Content -Path $Path -Value $line -Encoding UTF8
        return
    }

    $escapedKey = [regex]::Escape($Key)
    $found = $false
    $updated = foreach ($entry in Get-Content $Path) {
        if ($entry -match "^\s*$escapedKey=") {
            $found = $true
            $line
        } else {
            $entry
        }
    }

    if ($found) {
        Set-Content -Path $Path -Value $updated -Encoding UTF8
    } else {
        Add-Content -Path $Path -Value $line -Encoding UTF8
    }
}

function New-SessionSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    } finally {
        $rng.Dispose()
    }

    return -join ($bytes | ForEach-Object { $_.ToString('x2') })
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $projectRoot

Write-Host "Aotea House Points - Windows setup" -ForegroundColor Green
Write-Host "Project: $projectRoot"

Write-Step "Checking Node.js and npm"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not installed. Install LTS from https://nodejs.org and rerun this script."
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is not available. Reinstall Node.js LTS and rerun this script."
}

Write-Step "Preparing .env file"
if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host "Created .env from .env.example"
} else {
    Write-Host ".env already exists - leaving as-is"
}

Write-Step "Installing server + client dependencies"
Invoke-Tool -FilePath 'npm' -Arguments @('run', 'install:all')

Write-Step "Finding PostgreSQL tools"
$psqlPath = Resolve-ToolPath -ToolName 'psql' -Pattern 'C:\Program Files\PostgreSQL\*\bin\psql.exe'
if (-not $psqlPath) {
    throw "psql was not found. Install PostgreSQL for Windows and ensure psql is in PATH."
}

Write-Host "Using psql: $psqlPath"

$dbName = 'house_points'
$dbUserInput = Read-Host "PostgreSQL username (press Enter for 'postgres')"
$dbUser = if ([string]::IsNullOrWhiteSpace($dbUserInput)) { 'postgres' } else { $dbUserInput.Trim() }
$dbPasswordSecure = Read-Host "PostgreSQL password for '$dbUser' (leave blank only if local trust auth is enabled)" -AsSecureString
$dbPassword = ConvertFrom-SecureStringToPlainText $dbPasswordSecure

$encodedDbUser = [System.Uri]::EscapeDataString($dbUser)
$databaseUrl = if ([string]::IsNullOrEmpty($dbPassword)) {
    "postgresql://$encodedDbUser@localhost:5432/$dbName"
} else {
    $encodedDbPassword = [System.Uri]::EscapeDataString($dbPassword)
    "postgresql://$encodedDbUser`:$encodedDbPassword@localhost:5432/$dbName"
}

Write-Step "Writing app database settings"
Set-DotEnvValue -Path '.env' -Key 'DATABASE_URL' -Value $databaseUrl
Set-DotEnvValue -Path '.env' -Key 'PORT' -Value '3001'
Set-DotEnvValue -Path '.env' -Key 'CLIENT_URL' -Value 'http://localhost:3000'

$currentSessionSecret = Get-DotEnvValue -Path '.env' -Key 'SESSION_SECRET'
if ([string]::IsNullOrWhiteSpace($currentSessionSecret) -or $currentSessionSecret -eq 'replace-this-with-a-long-random-secret') {
    Set-DotEnvValue -Path '.env' -Key 'SESSION_SECRET' -Value (New-SessionSecret)
}

$previousPgPassword = $env:PGPASSWORD
if (-not [string]::IsNullOrEmpty($dbPassword)) {
    $env:PGPASSWORD = $dbPassword
}

try {
    Write-Step "Creating database if it does not exist"
    $dbExistsResult = & $psqlPath '-U' $dbUser '-h' 'localhost' '-d' 'postgres' '-tAc' "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
    if ($LASTEXITCODE -ne 0) {
        throw "Could not connect to PostgreSQL as user '$dbUser'."
    }

    if ($dbExistsResult.Trim() -eq '1') {
        Write-Host "Database '$dbName' already exists"
    } else {
        Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-h', 'localhost', '-d', 'postgres', '-c', "CREATE DATABASE $dbName;")
        Write-Host "Created database '$dbName'"
    }

    Write-Step "Applying schema"
    Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-h', 'localhost', '-d', $dbName, '-f', 'db/schema.sql')

    Write-Step "Applying seed data"
    Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-h', 'localhost', '-d', $dbName, '-f', 'db/seed.sql')
} finally {
    if ($null -eq $previousPgPassword) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    } else {
        $env:PGPASSWORD = $previousPgPassword
    }
}

Write-Step "Starting app"
Write-Host "Frontend: http://localhost:3000"
Write-Host "API health: http://localhost:3001/api/health"
& npm run dev
$devExitCode = $LASTEXITCODE
if ($devExitCode -ne 0) {
    Write-Host "The app stopped with exit code $devExitCode. Check the server/client error above." -ForegroundColor Yellow
    exit $devExitCode
}
