$ErrorActionPreference = "Stop"

$appsScriptUrl = "https://script.google.com/macros/s/AKfycbzDC-9cPiqoXtuCxsMTce1yZyUxrxy1Z3EAFyfPpbXY1NIxn8FEMYGxEqLEL_1rs_Tk_A/exec"
$secretBytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($secretBytes)
$secret = [Convert]::ToHexString($secretBytes).ToLowerInvariant()

$body = @{
  provision = $true
  secret = $secret
} | ConvertTo-Json

$result = Invoke-RestMethod `
  -Uri $appsScriptUrl `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

if (-not $result.ok) {
  throw "The Apps Script backend was not provisioned: $($result.status)"
}

Write-Host ""
Write-Host "Backend provisioned successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Add these two values in Vercel Environment Variables:"
Write-Host "GOOGLE_APPS_SCRIPT_URL=$appsScriptUrl"
Write-Host "GOOGLE_APPS_SCRIPT_SECRET=$secret"
Write-Host ""
Write-Host "Keep the secret private. Do not upload or commit it."
