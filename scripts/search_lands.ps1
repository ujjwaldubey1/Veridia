# Veridia Land Registry - Bulk Land Search Script
# Usage: .\search_lands.ps1 -StartId 1 -EndId 10
# Usage: .\search_lands.ps1 -ByOwner "0x123..."

param(
  [int]$StartId = 1,
  [int]$EndId = 5,
  [string]$ByOwner,
  [string]$ByJurisdiction,
  [string]$RegistryAddr = "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"
)

Write-Host "🔍 Veridia Land Registry - Bulk Search" -ForegroundColor Green
Write-Host ""

if ($ByOwner) {
  Write-Host "👤 Searching lands by owner: $ByOwner" -ForegroundColor Cyan
  Write-Host ""
    
  # Get next land ID to know the range
  $nextIdResult = aptos move view --function-id "$RegistryAddr::land_registry::get_next_land_id" --args "address:$RegistryAddr" | ConvertFrom-Json
  $maxId = [int]$nextIdResult.Result[0] - 1
    
  $foundLands = @()
    
  for ($i = 1; $i -le $maxId; $i++) {
    try {
      # Check if land exists
      $existsResult = aptos move view --function-id "$RegistryAddr::land_registry::land_exists" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
            
      if ($existsResult.Result[0] -eq $true) {
        # Check owner
        $ownerResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_owner" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
                
        if ($ownerResult.Result[0] -eq $ByOwner) {
          $foundLands += $i
          Write-Host "✅ Found land ID $i owned by $ByOwner" -ForegroundColor Green
        }
      }
    }
    catch {
      # Skip if error
    }
  }
    
  if ($foundLands.Count -eq 0) {
    Write-Host "❌ No lands found for owner: $ByOwner" -ForegroundColor Red
  }
  else {
    Write-Host ""
    Write-Host "📊 Summary: Found $($foundLands.Count) land(s) - IDs: $($foundLands -join ', ')" -ForegroundColor Yellow
  }
    
}
elseif ($ByJurisdiction) {
  Write-Host "📍 Searching lands by jurisdiction: $ByJurisdiction" -ForegroundColor Cyan
  Write-Host ""
    
  # Get next land ID to know the range
  $nextIdResult = aptos move view --function-id "$RegistryAddr::land_registry::get_next_land_id" --args "address:$RegistryAddr" | ConvertFrom-Json
  $maxId = [int]$nextIdResult.Result[0] - 1
    
  $foundLands = @()
    
  for ($i = 1; $i -le $maxId; $i++) {
    try {
      # Check if land exists
      $existsResult = aptos move view --function-id "$RegistryAddr::land_registry::land_exists" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
            
      if ($existsResult.Result[0] -eq $true) {
        # Check jurisdiction
        $jurisdictionResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_jurisdiction" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
                
        if ($jurisdictionResult.Result[0] -like "*$ByJurisdiction*") {
          $foundLands += $i
          Write-Host "✅ Found land ID $i in jurisdiction: $($jurisdictionResult.Result[0])" -ForegroundColor Green
        }
      }
    }
    catch {
      # Skip if error
    }
  }
    
  if ($foundLands.Count -eq 0) {
    Write-Host "❌ No lands found in jurisdiction: $ByJurisdiction" -ForegroundColor Red
  }
  else {
    Write-Host ""
    Write-Host "📊 Summary: Found $($foundLands.Count) land(s) - IDs: $($foundLands -join ', ')" -ForegroundColor Yellow
  }
    
}
else {
  Write-Host "📋 Listing lands from ID $StartId to $EndId" -ForegroundColor Cyan
  Write-Host ""
    
  for ($i = $StartId; $i -le $EndId; $i++) {
    Write-Host "🏗️  Land ID: $i" -ForegroundColor Yellow
        
    try {
      # Check if land exists
      $existsResult = aptos move view --function-id "$RegistryAddr::land_registry::land_exists" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
            
      if ($existsResult.Result[0] -eq $true) {
        # Get basic info
        $ownerResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_owner" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
        $jurisdictionResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_jurisdiction" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
        $statusResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_status" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
        $metadataResult = aptos move view --function-id "$RegistryAddr::land_registry::get_land_metadata_hash" --args "address:$RegistryAddr" "u64:$i" | ConvertFrom-Json
                
        $statusText = switch ($statusResult.Result[0]) {
          "0" { "Active" }
          "1" { "Frozen" }
          "2" { "Disputed" }
          "3" { "Invalidated" }
          default { "Unknown" }
        }
                
        Write-Host "  ✅ EXISTS" -ForegroundColor Green
        Write-Host "  👤 Owner: $($ownerResult.Result[0])" -ForegroundColor White
        Write-Host "  📍 Jurisdiction: $($jurisdictionResult.Result[0])" -ForegroundColor White
        Write-Host "  🔗 Metadata: $($metadataResult.Result[0])" -ForegroundColor White
        Write-Host "  📊 Status: $statusText" -ForegroundColor White
      }
      else {
        Write-Host "  ❌ Does not exist" -ForegroundColor Red
      }
    }
    catch {
      Write-Host "  ⚠️  Error retrieving data" -ForegroundColor Yellow
    }
        
    Write-Host ""
  }
}

Write-Host "💡 Usage examples:" -ForegroundColor Gray
Write-Host "   .\search_lands.ps1 -StartId 1 -EndId 10" -ForegroundColor Gray
Write-Host "   .\search_lands.ps1 -ByOwner '0x123...'" -ForegroundColor Gray
Write-Host "   .\search_lands.ps1 -ByJurisdiction 'California'" -ForegroundColor Gray
