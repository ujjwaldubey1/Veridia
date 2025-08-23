# Veridia Land Registry - Metadata Retrieval Script
# Usage: .\get_land_metadata.ps1 -LandId 1
# Usage: .\get_land_metadata.ps1 -LandId 1 -Detailed

param(
  [Parameter(Mandatory = $true)]
  [int]$LandId,
    
  [switch]$Detailed,
    
  [string]$RegistryAddr = "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"
)

Write-Host "🏗️  Veridia Land Registry - Metadata Retrieval" -ForegroundColor Green
Write-Host "📍 Land ID: $LandId" -ForegroundColor Yellow
Write-Host ""

# Check if land exists first
Write-Host "🔍 Checking if land exists..." -ForegroundColor Cyan
$existsResult = aptos move view --function-id "$RegistryAddr::land_registry::land_exists" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json

if ($existsResult.Result[0] -eq $false) {
  Write-Host "❌ Land ID $LandId does not exist!" -ForegroundColor Red
  exit 1
}

Write-Host "✅ Land exists! Retrieving metadata..." -ForegroundColor Green
Write-Host ""

if ($Detailed) {
  # Get complete land information
  Write-Host "📋 Complete Land Information:" -ForegroundColor Magenta
  $landInfo = aptos move view --function-id "$RegistryAddr::land_registry::get_land_info" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
    
  $id = $landInfo.Result[0]
  $owner = $landInfo.Result[1]
  $jurisdiction = $landInfo.Result[2]
  $metadataHash = $landInfo.Result[3]
  $status = $landInfo.Result[4]
  $registeredAt = $landInfo.Result[5]
    
  $statusText = switch ($status) {
    "0" { "Active" }
    "1" { "Frozen" }
    "2" { "Disputed" }
    "3" { "Invalidated" }
    default { "Unknown" }
  }
    
  # Convert timestamp to readable date
  $timestamp = [System.DateTimeOffset]::FromUnixTimeMilliseconds([long]$registeredAt / 1000)
    
  Write-Host "  🆔 Land ID: $id" -ForegroundColor White
  Write-Host "  👤 Owner: $owner" -ForegroundColor White
  Write-Host "  📍 Jurisdiction: $jurisdiction" -ForegroundColor White
  Write-Host "  🔗 Metadata Hash: $metadataHash" -ForegroundColor White
  Write-Host "  📊 Status: $statusText ($status)" -ForegroundColor White
  Write-Host "  📅 Registered: $($timestamp.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White
  Write-Host ""
    
  # Additional checks
  Write-Host "🔧 Additional Information:" -ForegroundColor Magenta
    
  # Check if land can be transferred
  $canTransfer = aptos move view --function-id "$RegistryAddr::land_registry::can_transfer_land" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $transferStatus = if ($canTransfer.Result[0] -eq $true) { "✅ Yes" } else { "❌ No" }
  Write-Host "  🔄 Can Transfer: $transferStatus" -ForegroundColor White
    
}
else {
  # Quick metadata retrieval
  Write-Host "🗺️  Jurisdiction (Location):" -ForegroundColor Magenta
  $jurisdiction = aptos move view --function-id "$RegistryAddr::land_registry::get_land_jurisdiction" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  Write-Host "  📍 $($jurisdiction.Result[0])" -ForegroundColor White
  Write-Host ""
    
  Write-Host "🔗 Metadata Hash (IPFS/Arweave):" -ForegroundColor Magenta
  $metadataHash = aptos move view --function-id "$RegistryAddr::land_registry::get_land_metadata_hash" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  Write-Host "  🔗 $($metadataHash.Result[0])" -ForegroundColor White
  Write-Host ""
    
  Write-Host "👤 Owner:" -ForegroundColor Magenta
  $owner = aptos move view --function-id "$RegistryAddr::land_registry::get_land_owner" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  Write-Host "  👤 $($owner.Result[0])" -ForegroundColor White
  Write-Host ""
    
  Write-Host "📊 Status:" -ForegroundColor Magenta
  $status = aptos move view --function-id "$RegistryAddr::land_registry::get_land_status" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $statusText = switch ($status.Result[0]) {
    "0" { "Active" }
    "1" { "Frozen" }
    "2" { "Disputed" }
    "3" { "Invalidated" }
    default { "Unknown" }
  }
  Write-Host "  📊 $statusText ($($status.Result[0]))" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Use -Detailed flag for complete information" -ForegroundColor Gray
Write-Host "🌐 Access full documents using the metadata hash on IPFS/Arweave" -ForegroundColor Gray
