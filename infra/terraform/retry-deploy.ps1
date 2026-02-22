# ---
# OCI Availability Loop (Always Free Tier)
# This script retries 'terraform apply' until a slot opens up in your region.
# ---

$terraformPath = "C:\Users\domte\AppData\Local\Microsoft\WinGet\Packages\Hashicorp.Terraform_Microsoft.WinGet.Source_8wekyb3d8bbwe\terraform.exe"
Set-Location -Path $PSScriptRoot
$retryDelaySeconds = 60 # Check every 1 minute
$maxRetries = 1440      # Try for 24 hours

Write-Host "`n🚀 Starting OCI Availability Loop..." -ForegroundColor Cyan
Write-Host "Target: Always Free ARM Instance (4 OCPU / 24GB RAM)"
Write-Host "Region: eu-zurich-1"
Write-Host "Interval: $retryDelaySeconds seconds`n"

for ($i = 1; $i -le $maxRetries; $i++) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Attempt #$i in progress..." -NoNewline

    # Execute terraform apply and capture output
    $output = & $terraformPath apply -auto-approve 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "`n===================================================="
        Write-Host "Your ERM Production Server is LIVE."
        Write-Host "====================================================`n"
        & $terraformPath output
        break
    } else {
        # Check if the error is specifically capacity
        if ($output -match "Out of host capacity") {
            Write-Host " ⚠️ Capacity Locked. Retrying in $retryDelaySeconds seconds..." -ForegroundColor Yellow
        } else {
            Write-Host " ❌ CRITICAL ERROR" -ForegroundColor Red
            Write-Output $output
            Write-Host "`nTerminating loop due to non-capacity error."
            exit 1
        }
        Start-Sleep -Seconds $retryDelaySeconds
    }
}
