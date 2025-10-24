# IPFS Practical Examples for Veridia Land Registry

## 🚀 Getting Started with IPFS

### 1. Install IPFS

```bash
# Download IPFS
wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
tar -xzf go-ipfs_v0.20.0_linux-amd64.tar.gz
cd go-ipfs
sudo ./install.sh

# Initialize IPFS node
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 2. Upload Land Documents

```bash
# Create a sample land document
echo "Land Deed for Property at 123 Main St, California" > land_deed.txt

# Upload to IPFS
ipfs add land_deed.txt
# Output: added QmSampleHashForLandDocument123456789 land_deed.txt

# Upload multiple files
mkdir land_documents
echo "Survey data..." > land_documents/survey.pdf
echo "Property photos..." > land_documents/photos.zip
ipfs add -r land_documents/
```

### 3. Pin Important Content

```bash
# Pin content to keep it available
ipfs pin add QmSampleHashForLandDocument123456789

# List pinned content
ipfs pin ls
```

## 🔗 IPFS Gateway URLs

Once you have an IPFS hash, you can access it through various gateways:

```bash
# Your IPFS hash
HASH="QmSampleHashForLandDocument123456789"

# Different gateway URLs
echo "https://ipfs.io/ipfs/$HASH"
echo "https://gateway.pinata.cloud/ipfs/$HASH"
echo "https://cloudflare-ipfs.com/ipfs/$HASH"
echo "https://dweb.link/ipfs/$HASH"
```

## 📱 JavaScript Integration

### Using IPFS in Your Frontend

```javascript
// Install: npm install ipfs-http-client
import { create } from "ipfs-http-client"

const ipfs = create("https://ipfs.infura.io:5001")

// Upload file to IPFS
async function uploadToIPFS(file) {
	const result = await ipfs.add(file)
	return result.path // Returns the IPFS hash
}

// Retrieve file from IPFS
async function getFromIPFS(hash) {
	const chunks = []
	for await (const chunk of ipfs.cat(hash)) {
		chunks.push(chunk)
	}
	return Buffer.concat(chunks)
}
```

### React Hook for IPFS

```javascript
import { useState } from "react"
import { create } from "ipfs-http-client"

const ipfs = create("https://ipfs.infura.io:5001")

export const useIPFS = () => {
	const [uploading, setUploading] = useState(false)

	const uploadFile = async (file) => {
		setUploading(true)
		try {
			const result = await ipfs.add(file)
			return result.path
		} catch (error) {
			console.error("IPFS upload failed:", error)
			throw error
		} finally {
			setUploading(false)
		}
	}

	const getFileUrl = (hash) => {
		return `https://ipfs.io/ipfs/${hash}`
	}

	return { uploadFile, getFileUrl, uploading }
}
```

## 🏗️ Land Registry Integration

### Complete Land Registration Flow

```javascript
// 1. Upload land documents to IPFS
const landDocuments = {
	deed: new File([deedContent], "deed.pdf"),
	survey: new File([surveyContent], "survey.pdf"),
	photos: new File([photoContent], "photos.zip"),
}

// 2. Create metadata JSON
const metadata = {
	title: "Land Deed for 123 Main St",
	description: "Property in California, USA",
	documents: {
		deed: "QmDeedHash...",
		survey: "QmSurveyHash...",
		photos: "QmPhotosHash...",
	},
	coordinates: {
		lat: 37.7749,
		lng: -122.4194,
	},
	area: "5000 sq ft",
	registered_date: new Date().toISOString(),
}

// 3. Upload metadata to IPFS
const metadataFile = new File([JSON.stringify(metadata)], "metadata.json")
const metadataHash = await uploadFile(metadataFile)

// 4. Register land with IPFS hash
await registerLand(
	ownerAddress,
	"California, USA",
	metadataHash // This goes into the blockchain
)
```

## 🔍 Retrieving Land Documents

### From Frontend

```javascript
// Get land info from blockchain
const landInfo = await getLand(landId)
const ipfsHash = landInfo.metadata_hash

// Access the full metadata
const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`)
const metadata = await response.json()

// Now you have access to all documents
console.log("Deed:", metadata.documents.deed)
console.log("Survey:", metadata.documents.survey)
console.log("Photos:", metadata.documents.photos)
```

### From Command Line

```bash
# Get metadata hash from blockchain
METADATA_HASH=$(aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_metadata_hash \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1 | jq -r '.Result[0]')

# Download the metadata
curl "https://ipfs.io/ipfs/$METADATA_HASH" > land_metadata.json

# View the metadata
cat land_metadata.json
```

## 🛡️ IPFS Security & Best Practices

### 1. Content Verification

```javascript
// Verify content hasn't been tampered with
async function verifyContent(hash, expectedContent) {
	const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
	const content = await response.text()
	const calculatedHash = await ipfs.add(content)
	return calculatedHash.path === hash
}
```

### 2. Redundant Storage

```javascript
// Pin content to multiple IPFS nodes
const pinToMultipleNodes = async (hash) => {
	const nodes = [
		"https://ipfs.infura.io:5001",
		"https://ipfs.io:5001",
		"https://gateway.pinata.cloud:5001",
	]

	for (const node of nodes) {
		try {
			await fetch(`${node}/api/v0/pin/add?arg=${hash}`)
		} catch (error) {
			console.warn(`Failed to pin to ${node}`)
		}
	}
}
```

### 3. Metadata Schema Validation

```javascript
const landMetadataSchema = {
	type: "object",
	required: ["title", "description", "documents", "coordinates"],
	properties: {
		title: { type: "string" },
		description: { type: "string" },
		documents: {
			type: "object",
			required: ["deed"],
			properties: {
				deed: { type: "string", pattern: "^Qm[A-Za-z0-9]{44}$" },
				survey: { type: "string", pattern: "^Qm[A-Za-z0-9]{44}$" },
				photos: { type: "string", pattern: "^Qm[A-Za-z0-9]{44}$" },
			},
		},
		coordinates: {
			type: "object",
			required: ["lat", "lng"],
			properties: {
				lat: { type: "number", minimum: -90, maximum: 90 },
				lng: { type: "number", minimum: -180, maximum: 180 },
			},
		},
	},
}
```

## 🌐 IPFS vs Other Storage Solutions

| Feature              | IPFS     | Arweave  | AWS S3      | Traditional Web |
| -------------------- | -------- | -------- | ----------- | --------------- |
| Decentralized        | ✅       | ✅       | ❌          | ❌              |
| Immutable            | ✅       | ✅       | ❌          | ❌              |
| Permanent            | ⚠️       | ✅       | ❌          | ❌              |
| Cost                 | Free\*   | Pay once | Pay per use | Pay per use     |
| Speed                | Variable | Fast     | Fast        | Fast            |
| Censorship Resistant | ✅       | ✅       | ❌          | ❌              |

\*Free if content is pinned by someone

## 🚀 Advanced IPFS Features

### 1. IPNS (InterPlanetary Name System)

```bash
# Create a mutable pointer to your content
ipfs name publish QmYourContentHash
# Returns: /ipns/12D3KooWYourNodeId

# Update the pointer
ipfs name publish QmNewContentHash
```

### 2. IPFS Clusters

```bash
# Set up IPFS cluster for redundancy
ipfs-cluster-service init
ipfs-cluster-service daemon
```

### 3. Custom IPFS Gateways

```javascript
// Set up your own IPFS gateway
const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")

const app = express()

app.use(
	"/ipfs",
	createProxyMiddleware({
		target: "http://localhost:8080",
		changeOrigin: true,
		pathRewrite: {
			"^/ipfs": "/ipfs",
		},
	})
)
```

## 🔧 Troubleshooting IPFS

### Common Issues

1. **Content not accessible**: Content might not be pinned
2. **Slow loading**: Try different gateways
3. **Upload failures**: Check IPFS daemon is running

### Debug Commands

```bash
# Check IPFS status
ipfs id

# Check if content is pinned
ipfs pin ls | grep QmYourHash

# Test connectivity
ipfs ping /ipfs/QmYourHash

# Check content
ipfs cat QmYourHash
```

## 📊 IPFS Performance Tips

1. **Use multiple gateways** for redundancy
2. **Pin important content** to keep it available
3. **Use IPFS clusters** for enterprise applications
4. **Cache frequently accessed content** locally
5. **Use IPNS** for mutable content that needs updates

This comprehensive guide should help you understand and implement IPFS in your Veridia Land Registry project!
