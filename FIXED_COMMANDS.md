# ✅ **FIXED - Working Commands for Current Deployed Contract**

## 🎯 **Issue Resolution Summary**

❌ **Problem**: `get_land_info` function doesn't exist in deployed contract  
✅ **Solution**: Use individual functions to get complete information

---

## 🚀 **Ready-to-Use Commands**

### **1. Complete Land Information (PowerShell)**

```powershell
# Run our PowerShell script for formatted output
.\scripts\get_complete_land_info.ps1 -LandId 1

# Or run individual commands:
Write-Host "=== LAND ID 1 COMPLETE INFO ==="
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_jurisdiction --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **2. Individual Elements (All Working ✅)**

**Get Metadata Hash:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

**Get Jurisdiction:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_jurisdiction --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

**Get Owner:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

**Get Status:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

**Check if Land Exists:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::land_exists --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

**Get Total Registered Lands:**

```bash
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_next_land_id --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

---

## 📊 **Verified Working Results**

### **Metadata Hash:**

```json
{
	"Result": ["QmSampleHashForLandDocument123456789"]
}
```

### **Jurisdiction:**

```json
{
	"Result": ["California, USA"]
}
```

### **Owner:**

```json
{
	"Result": [
		"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
	]
}
```

### **Status:**

```json
{
	"Result": [2]
}
```

_(Where: 0=Active, 1=Frozen, 2=Disputed, 3=Invalidated)_

### **Land Exists:**

```json
{
	"Result": [true]
}
```

---

## 🔗 **Access Full Documents**

Once you get the metadata hash: `QmSampleHashForLandDocument123456789`

**IPFS Access URLs:**

- https://ipfs.io/ipfs/QmSampleHashForLandDocument123456789
- https://gateway.pinata.cloud/ipfs/QmSampleHashForLandDocument123456789
- https://cloudflare-ipfs.com/ipfs/QmSampleHashForLandDocument123456789

---

## 🎯 **Quick Test**

**Test the PowerShell script:**

```powershell
.\scripts\get_complete_land_info.ps1 -LandId 1
```

**Test different land IDs:**

```bash
# Test land ID 2
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:2

# Test land ID 3
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:3
```

---

## ✅ **All Commands Above Are Tested and Working!**

The issue is now **fully resolved**. You can use any of these commands immediately without the `get_land_info` error.
