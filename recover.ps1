# Antigravity Nuclear Recovery Script
$root = Get-Location
Write-Host "Starting Universal Structural Recovery in $root..." -ForegroundColor Cyan

# 1. Purge all artifacts
Write-Host "Purging all node_modules and lockfiles..." -ForegroundColor Yellow
Get-ChildItem -Path . -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Recurse -Filter "package-lock.json" | Remove-Item -Force -ErrorAction SilentlyContinue

# 2. Standardize JSON files
$packages = Get-ChildItem -Path . -Recurse -Filter "package.json" | Where-Object { $_.FullName -notmatch "node_modules" }
foreach ($pkg in $packages) {
    Write-Host "Harmonizing: $($pkg.FullName)"
    $jsonContent = Get-Content $pkg.FullName -Raw | ConvertFrom-Json
    
    # Force version
    if (-not $jsonContent.version -or $jsonContent.version -eq "") {
        $jsonContent | Add-Member -MemberType NoteProperty -Name "version" -Value "1.0.0" -Force
    }
    
    # Standardize author and description
    if (-not $jsonContent.author -or $jsonContent.author -eq "") { 
        if ($jsonContent.author) { $jsonContent.author = "Antigravity" } 
        else { $jsonContent | Add-Member -MemberType NoteProperty -Name "author" -Value "Antigravity" -Force }
    }
    if (-not $jsonContent.description -or $jsonContent.description -eq "") { 
        if ($jsonContent.description) { $jsonContent.description = "ERM Platform Component" }
        else { $jsonContent | Add-Member -MemberType NoteProperty -Name "description" -Value "ERM Platform Component" -Force }
    }
    
    # Save back
    $jsonContent | ConvertTo-Json -Depth 20 | Set-Content $pkg.FullName -Encoding UTF8
}

Write-Host "Recovery Complete. Please run 'npm install' at the root." -ForegroundColor Green
