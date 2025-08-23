# 🗺️ Veridia Land Registry - Metadata & Location Commands

## 📋 Quick Reference

**Registry Address**: `0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17`

## 🏗️ **Basic Setup**

### **For Git Bash/Linux/Mac:**

```bash
# Set environment variable for easier use
export REGISTRY_ADDR="0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"
echo $REGISTRY_ADDR  # Verify it's set correctly
```

### **For PowerShell:**

```powershell
# Set environment variable for easier use
$REGISTRY_ADDR = "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"
Write-Host $REGISTRY_ADDR  # Verify it's set correctly
```

## 📍 **1. Individual Land Element Retrieval**

### **Get Complete Land Information**

**Git Bash/Linux/Mac:**

```bash
# Returns: [id, owner, jurisdiction, metadata_hash, status, registered_at]
aptos move view \
  --function-id ${REGISTRY_ADDR}::land_registry::get_land_info \
  --args address:${REGISTRY_ADDR} u64:1
```

**PowerShell:**

```powershell
aptos move view `
  --function-id "$REGISTRY_ADDR::land_registry::get_land_info" `
  --args "address:$REGISTRY_ADDR" "u64:1"
```

**Direct Command (Works everywhere):**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_info \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **Get Metadata Hash (IPFS/Arweave Location)**

**Direct Command:**

```bash
# Get metadata hash for land ID 1
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# Example: Returns "QmSampleHashForLandDocument123456789"
```

### **Get Geographic Location (Jurisdiction)**

```bash
# Get jurisdiction for land ID 1
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::get_land_jurisdiction \
  --args address:$REGISTRY_ADDR u64:1

# Example: Returns "California, USA"
```

### **Get Land Owner**

```bash
# Get owner address for land ID 1
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::get_land_owner \
  --args address:$REGISTRY_ADDR u64:1

# Example: Returns "0x1234567890abcdef..."
```

### **Get Land Status**

```bash
# Get status for land ID 1
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::get_land_status \
  --args address:$REGISTRY_ADDR u64:1

# Returns: 0=Active, 1=Frozen, 2=Disputed, 3=Invalidated
```

## 🔍 **2. Land Discovery Commands**

### **Check if Land Exists**

```bash
# Check if land ID exists
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::land_exists \
  --args address:$REGISTRY_ADDR u64:1

# Returns: true or false
```

### **Get Total Number of Lands**

```bash
# Get next land ID (total registered = next_id - 1)
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::get_next_land_id \
  --args address:$REGISTRY_ADDR

# If returns 5, then there are 4 registered lands (IDs 1-4)
```

### **Check Land Ownership**

```bash
# Check if specific address owns a land
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::is_land_owner \
  --args address:$REGISTRY_ADDR u64:1 address:0x123...

# Returns: true or false
```

### **Check Transfer Eligibility**

```bash
# Check if land can be transferred (not frozen/invalidated)
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::can_transfer_land \
  --args address:$REGISTRY_ADDR u64:1

# Returns: true or false
```

## 📊 **3. Batch Operations**

### **PowerShell Scripts (Windows)**

#### **Get Single Land Metadata**

```powershell
# Basic information
.\scripts\get_land_metadata.ps1 -LandId 1

# Detailed information
.\scripts\get_land_metadata.ps1 -LandId 1 -Detailed
```

#### **Search Multiple Lands**

```powershell
# List lands in range
.\scripts\search_lands.ps1 -StartId 1 -EndId 10

# Find lands by owner
.\scripts\search_lands.ps1 -ByOwner "0x1234567890abcdef..."

# Find lands by jurisdiction
.\scripts\search_lands.ps1 -ByJurisdiction "California"
```

### **Bash Scripts (Linux/Mac)**

```bash
# Make script executable (Linux/Mac only)
chmod +x scripts/get_land_metadata.sh

# Basic information
./scripts/get_land_metadata.sh 1

# Detailed information
./scripts/get_land_metadata.sh 1 --detailed
```

## 🗂️ **4. Practical Examples**

### **Example 1: Get All Information for Land ID 1**

```bash
echo "🏗️ Complete Land Information for ID 1:"
aptos move view \
  --function-id $REGISTRY_ADDR::land_registry::get_land_info \
  --args address:$REGISTRY_ADDR u64:1
```

### **Example 2: Find All Active Lands (Status = 0)**

```bash
echo "🔍 Searching for active lands..."

# Get total number of lands
TOTAL=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_next_land_id --args address:$REGISTRY_ADDR | jq -r '.Result[0]')

for ((i=1; i<$TOTAL; i++)); do
  STATUS=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_status --args address:$REGISTRY_ADDR u64:$i | jq -r '.Result[0]' 2>/dev/null)
  if [ "$STATUS" = "0" ]; then
    echo "✅ Land ID $i is Active"
  fi
done
```

### **Example 3: Get IPFS Metadata Links**

```bash
echo "🔗 IPFS Metadata Links:"

for LAND_ID in 1 2 3 4 5; do
  HASH=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_metadata_hash --args address:$REGISTRY_ADDR u64:$LAND_ID 2>/dev/null | jq -r '.Result[0]' 2>/dev/null)
  if [ ! -z "$HASH" ] && [ "$HASH" != "null" ]; then
    echo "Land ID $LAND_ID: https://ipfs.io/ipfs/$HASH"
  fi
done
```

### **Example 4: Create Land Summary Report**

```bash
echo "📊 Land Registry Summary Report"
echo "=============================="

# Total lands
TOTAL=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_next_land_id --args address:$REGISTRY_ADDR | jq -r '.Result[0]')
echo "Total Registered Lands: $((TOTAL-1))"

# Admin info
ADMIN=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_admin --args address:$REGISTRY_ADDR | jq -r '.Result[0]')
echo "Registry Administrator: $ADMIN"

echo ""
echo "📋 Land Details:"
for ((i=1; i<$TOTAL; i++)); do
  EXISTS=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::land_exists --args address:$REGISTRY_ADDR u64:$i | jq -r '.Result[0]')
  if [ "$EXISTS" = "true" ]; then
    OWNER=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_owner --args address:$REGISTRY_ADDR u64:$i | jq -r '.Result[0]')
    JURISDICTION=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_jurisdiction --args address:$REGISTRY_ADDR u64:$i | jq -r '.Result[0]')
    STATUS=$(aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_status --args address:$REGISTRY_ADDR u64:$i | jq -r '.Result[0]')

    STATUS_TEXT="Unknown"
    case $STATUS in
      "0") STATUS_TEXT="Active" ;;
      "1") STATUS_TEXT="Frozen" ;;
      "2") STATUS_TEXT="Disputed" ;;
      "3") STATUS_TEXT="Invalidated" ;;
    esac

    echo "  🏗️ Land ID $i: $JURISDICTION ($STATUS_TEXT)"
    echo "     👤 Owner: ${OWNER:0:20}..."
  fi
done
```

## 🔧 **5. Advanced Queries**

### **Get Registry Statistics**

```bash
# Get total lands
aptos move view --function-id $REGISTRY_ADDR::land_registry::get_next_land_id --args address:$REGISTRY_ADDR

# Get registry admin
aptos move view --function-id $REGISTRY_ADDR::land_registry::get_admin --args address:$REGISTRY_ADDR
```

### **Validate Land Data**

```bash
# Check if land ID 1 exists and get all its data
LAND_ID=1
if aptos move view --function-id $REGISTRY_ADDR::land_registry::land_exists --args address:$REGISTRY_ADDR u64:$LAND_ID | jq -r '.Result[0]' | grep -q "true"; then
  echo "✅ Land ID $LAND_ID exists"
  aptos move view --function-id $REGISTRY_ADDR::land_registry::get_land_info --args address:$REGISTRY_ADDR u64:$LAND_ID
else
  echo "❌ Land ID $LAND_ID does not exist"
fi
```

## 📝 **6. Output Format Examples**

### **get_land_info Output**

```json
{
	"Result": [
		"1", // Land ID
		"0x1234567890abcdef...", // Owner address
		"California, USA", // Jurisdiction
		"QmSampleHashForLandDocument123456789", // Metadata hash
		"0", // Status (0=Active)
		"1755944894406351" // Registration timestamp
	]
}
```

### **Status Values Reference**

- `0` = Active (land can be transferred)
- `1` = Frozen (land cannot be transferred)
- `2` = Disputed (land cannot be transferred)
- `3` = Invalidated (land cannot be transferred)

## 🌐 **7. Accessing Off-Chain Metadata**

Once you get the metadata hash, you can access the full land documents:

```bash
# Example metadata hash: QmSampleHashForLandDocument123456789
# IPFS Gateway URLs:
https://ipfs.io/ipfs/QmSampleHashForLandDocument123456789
https://gateway.pinata.cloud/ipfs/QmSampleHashForLandDocument123456789
https://cloudflare-ipfs.com/ipfs/QmSampleHashForLandDocument123456789

# Arweave URLs (if using Arweave):
https://arweave.net/[ARWEAVE_HASH]
```

## ⚡ **8. Performance Tips**

1. **Batch Queries**: Use scripts for multiple land queries
2. **Cache Results**: Store frequently accessed land data locally
3. **Parallel Requests**: Query multiple lands simultaneously
4. **Filter Early**: Check `land_exists` before getting detailed info

## 🛠️ **9. Troubleshooting**

### **Common Errors**

```bash
# Error: Land not found
"abort_code": "393218" # E_LAND_NOT_FOUND

# Error: Registry not initialized
"abort_code": "327685" # E_REGISTRY_NOT_INITIALIZED
```

### **Debug Commands**

```bash
# Check if registry exists
aptos account lookup-address --account $REGISTRY_ADDR

# Check if land exists before querying
aptos move view --function-id $REGISTRY_ADDR::land_registry::land_exists --args address:$REGISTRY_ADDR u64:1
```

---

**💡 Pro Tip**: Use the PowerShell scripts in the `scripts/` folder for automated land metadata retrieval and searching!
