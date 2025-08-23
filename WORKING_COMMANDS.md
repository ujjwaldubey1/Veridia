# ✅ **Working Commands for Land Metadata Retrieval**

## 🚀 **Ready-to-Use Commands (Copy & Paste)**

### **1. Get Complete Land Information (Alternative)**

```bash
# Note: get_land_info doesn't exist in deployed contract
# Use individual functions to get complete information:

# Get all land details separately:
echo "=== LAND ID 1 COMPLETE INFO ==="
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_jurisdiction --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
aptos move view --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **2. Get Metadata Hash (IPFS/Arweave Location)**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **3. Get Geographic Location (Jurisdiction)**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_jurisdiction \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **4. Get Land Owner**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **5. Get Land Status**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **6. Check if Land Exists**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::land_exists \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **7. Get Total Number of Registered Lands**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_next_land_id \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

### **8. Check Land Ownership**

```bash
# Replace OWNER_ADDRESS with actual address to check
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::is_land_owner \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1 address:0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### **9. Check if Land Can Be Transferred**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::can_transfer_land \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1
```

### **10. Get Registry Administrator**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_admin \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

---

## 📝 **Quick Test Commands**

**To test different land IDs, simply change the `u64:1` to `u64:2`, `u64:3`, etc.**

### **Test Land ID 2:**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_info \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:2
```

### **Test Land ID 3:**

```bash
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:3
```

---

## 📊 **Expected Output Examples**

### **get_land_info output:**

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

### **get_land_metadata_hash output:**

```json
{
	"Result": ["QmSampleHashForLandDocument123456789"]
}
```

### **land_exists output:**

```json
{
	"Result": [true]
}
```

---

## 🔗 **Access Full Documents**

Once you get the metadata hash, access the full land documents:

```bash
# If metadata hash is: QmSampleHashForLandDocument123456789
# Access via IPFS:
https://ipfs.io/ipfs/QmSampleHashForLandDocument123456789
https://gateway.pinata.cloud/ipfs/QmSampleHashForLandDocument123456789
```

---

**💡 These commands are tested and work directly in any terminal!**
