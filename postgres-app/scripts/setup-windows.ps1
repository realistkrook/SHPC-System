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

Write-Step "Creating database if it does not exist"
$dbExistsResult = & $psqlPath '-U' $dbUser '-d' 'postgres' '-tAc' "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
if ($LASTEXITCODE -ne 0) {
    throw "Could not connect to PostgreSQL as user '$dbUser'."
}

if ($dbExistsResult.Trim() -eq '1') {
    Write-Host "Database '$dbName' already exists"
} else {
    Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-d', 'postgres', '-c', "CREATE DATABASE $dbName;")
    Write-Host "Created database '$dbName'"
}

Write-Step "Applying schema"
Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-d', $dbName, '-f', 'db/schema.sql')

Write-Step "Applying seed data"
Invoke-Tool -FilePath $psqlPath -Arguments @('-U', $dbUser, '-d', $dbName, '-f', 'db/seed.sql')

Write-Step "Starting app"
Write-Host "Frontend: http://localhost:3000"
Write-Host "API health: http://localhost:3001/api/health"
Invoke-Tool -FilePath 'npm' -Arguments @('run', 'dev')