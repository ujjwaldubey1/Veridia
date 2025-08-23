#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Get complete land information using individual view functions
.DESCRIPTION
    Since get_land_info doesn't exist in the deployed contract, this script 
    combines multiple individual function calls to get complete land information.
.PARAMETER LandId
    The ID of the land to query (default: 1)
.PARAMETER RegistryAddr
    The registry contract address (default: deployed address)
.EXAMPLE
    .\get_complete_land_info.ps1 -LandId 1
.EXAMPLE
    .\get_complete_land_info.ps1 -LandId 2 -RegistryAddr "0x123..."
#>

param(
  [Parameter(Mandatory = $false)]
  [int]$LandId = 1,
    
  [Parameter(Mandatory = $false)]
  [string]$RegistryAddr = "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"
)

# Status mapping
$StatusMap = @{
  0 = "Active"
  1 = "Frozen" 
  2 = "Disputed"
  3 = "Invalidated"
}

Write-Host "============================================" -ForegroundColor Green
Write-Host "        COMPLETE LAND INFORMATION" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "Land ID: $LandId" -ForegroundColor Yellow
Write-Host "Registry: $RegistryAddr" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green

try {
  # Check if land exists first
  Write-Host "`n[INFO] Checking if land exists..." -ForegroundColor Blue
  $existsResult = aptos move view --function-id "${RegistryAddr}::land_registry::land_exists" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
    
  if (-not $existsResult.Result[0]) {
    Write-Host "[ERROR] Land ID $LandId does not exist!" -ForegroundColor Red
    exit 1
  }
  Write-Host "[SUCCESS] Land exists" -ForegroundColor Green

  # Get owner
  Write-Host "`n[INFO] Getting land owner..." -ForegroundColor Blue
  $ownerResult = aptos move view --function-id "${RegistryAddr}::land_registry::get_land_owner" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $owner = $ownerResult.Result[0]
  Write-Host "Owner: $owner" -ForegroundColor White

  # Get jurisdiction
  Write-Host "`n[INFO] Getting jurisdiction..." -ForegroundColor Blue
  $jurisdictionResult = aptos move view --function-id "${RegistryAddr}::land_registry::get_land_jurisdiction" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $jurisdiction = $jurisdictionResult.Result[0]
  Write-Host "Jurisdiction: $jurisdiction" -ForegroundColor White

  # Get metadata hash
  Write-Host "`n[INFO] Getting metadata hash..." -ForegroundColor Blue
  $metadataResult = aptos move view --function-id "${RegistryAddr}::land_registry::get_land_metadata_hash" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $metadataHash = $metadataResult.Result[0]
  Write-Host "Metadata Hash: $metadataHash" -ForegroundColor White

  # Get status
  Write-Host "`n[INFO] Getting status..." -ForegroundColor Blue
  $statusResult = aptos move view --function-id "${RegistryAddr}::land_registry::get_land_status" --args "address:$RegistryAddr" "u64:$LandId" | ConvertFrom-Json
  $statusValue = [int]$statusResult.Result[0]
  $statusText = $StatusMap[$statusValue]
  Write-Host "Status: $statusValue ($statusText)" -ForegroundColor White

  # Get next land ID (total registrations)
  Write-Host "`n[INFO] Getting total registrations..." -ForegroundColor Blue
  $nextIdResult = aptos move view --function-id "${RegistryAddr}::land_registry::get_next_land_id" --args "address:$RegistryAddr" | ConvertFrom-Json
  $nextId = $nextIdResult.Result[0]
  $totalLands = $nextId - 1
  Write-Host "Total Registered Lands: $totalLands" -ForegroundColor White

  # Summary
  Write-Host "`n============================================" -ForegroundColor Green
  Write-Host "              SUMMARY" -ForegroundColor Green
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "Land ID:        $LandId" -ForegroundColor Yellow
  Write-Host "Owner:          $owner" -ForegroundColor White
  Write-Host "Jurisdiction:   $jurisdiction" -ForegroundColor White
  Write-Host "Metadata Hash:  $metadataHash" -ForegroundColor White
  Write-Host "Status:         $statusValue ($statusText)" -ForegroundColor White
  Write-Host "============================================" -ForegroundColor Green

  # IPFS Links
  if ($metadataHash -and $metadataHash -ne "null") {
    Write-Host "`n[LINKS] Document Access Links:" -ForegroundColor Blue
    Write-Host "IPFS Gateway 1: https://ipfs.io/ipfs/$metadataHash" -ForegroundColor Cyan
    Write-Host "IPFS Gateway 2: https://gateway.pinata.cloud/ipfs/$metadataHash" -ForegroundColor Cyan
    Write-Host "IPFS Gateway 3: https://cloudflare-ipfs.com/ipfs/$metadataHash" -ForegroundColor Cyan
  }

  Write-Host "`n[SUCCESS] Land information retrieved successfully!" -ForegroundColor Green

}
catch {
  Write-Host "`n[ERROR] Error retrieving land information:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}