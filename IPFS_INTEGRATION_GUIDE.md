# 🌐 IPFS Integration Guide for Veridia Land Registry

## 📋 Overview

This guide shows you how to integrate IPFS (InterPlanetary File System) into your Veridia Land Registry project for storing land documents and metadata.

## 🎯 Why Use IPFS?

- **Decentralized Storage**: No single point of failure
- **Immutable Content**: Documents can't be tampered with
- **Cost-Effective**: No ongoing storage costs
- **Global Access**: Content available worldwide
- **Censorship Resistant**: Hard to block or remove

## 🚀 Quick Start

### 1. Install IPFS

```bash
# Download and install IPFS
wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
tar -xzf go-ipfs_v0.20.0_linux-amd64.tar.gz
cd go-ipfs
sudo ./install.sh

# Initialize IPFS node
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 2. Test IPFS

```bash
# Add a test file
echo "Hello IPFS!" > test.txt
ipfs add test.txt
# Output: added QmYourHashHere test.txt

# View the file
ipfs cat QmYourHashHere
```

## 🏗️ Integration with Veridia

### Step 1: Upload Land Documents

```bash
# Create land document directory
mkdir land_documents
cd land_documents

# Create sample documents
echo "Land Deed for Property at 123 Main St" > deed.txt
echo "Survey data for the property" > survey.txt
echo "Property photos and maps" > photos.txt

# Upload to IPFS
ipfs add -r .
# This will give you hashes for each file
```

### Step 2: Create Metadata JSON

```json
{
	"title": "Land Deed for 123 Main Street",
	"description": "Residential property in California, USA",
	"property_details": {
		"address": "123 Main Street, San Francisco, CA",
		"coordinates": {
			"latitude": 37.7749,
			"longitude": -122.4194
		},
		"area": "5000 square feet",
		"property_type": "Residential"
	},
	"documents": {
		"deed": "QmDeedHash123...",
		"survey": "QmSurveyHash456...",
		"photos": "QmPhotosHash789..."
	},
	"legal_info": {
		"parcel_number": "123-456-789",
		"zoning": "R1",
		"restrictions": ["Single family residential only"]
	},
	"registered_date": "2024-01-15T10:30:00Z"
}
```

### Step 3: Upload Metadata to IPFS

```bash
# Save metadata to file
echo '{"title":"Land Deed for 123 Main Street",...}' > metadata.json

# Upload to IPFS
ipfs add metadata.json
# Output: added QmMetadataHash123... metadata.json

# Pin the content to keep it available
ipfs pin add QmMetadataHash123...
```

### Step 4: Register Land with IPFS Hash

```bash
# Register land with the IPFS hash
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::register_land \
  --args address:0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
         string:"California, USA" \
         string:"QmMetadataHash123..."
```

## 🔧 Frontend Integration

### Update Your React Hook

```typescript
// Add to useLandRegistry.ts
export const useIPFS = () => {
	const [uploading, setUploading] = useState(false)

	const uploadToIPFS = async (file: File): Promise<string> => {
		setUploading(true)
		try {
			// In production, use your own IPFS node or service
			const formData = new FormData()
			formData.append("file", file)

			const response = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
				method: "POST",
				body: formData,
			})

			const result = await response.json()
			return result.Hash
		} catch (error) {
			console.error("IPFS upload failed:", error)
			throw error
		} finally {
			setUploading(false)
		}
	}

	const getIPFSURL = (hash: string): string => {
		return `https://ipfs.io/ipfs/${hash}`
	}

	return { uploadToIPFS, getIPFSURL, uploading }
}
```

### Update Land Registration Form

```typescript
// Add to App.tsx
const { uploadToIPFS, getIPFSURL } = useIPFS()

const handleRegisterWithDocuments = async () => {
	try {
		const values = await form.validateFields()

		// Upload documents to IPFS
		const documents = {
			deed: await uploadToIPFS(values.deedFile),
			survey: await uploadToIPFS(values.surveyFile),
			photos: await uploadToIPFS(values.photosFile),
		}

		// Create metadata
		const metadata = {
			title: values.title,
			description: values.description,
			documents,
			coordinates: {
				lat: values.latitude,
				lng: values.longitude,
			},
			registered_date: new Date().toISOString(),
		}

		// Upload metadata to IPFS
		const metadataFile = new File([JSON.stringify(metadata)], "metadata.json")
		const metadataHash = await uploadToIPFS(metadataFile)

		// Register land with IPFS hash
		await registerLand(values.owner, values.jurisdiction, metadataHash)

		message.success("Land registered with documents!")
	} catch (error) {
		message.error("Registration failed: " + error.message)
	}
}
```

### Display IPFS Content

```typescript
// Add to App.tsx
const [landMetadata, setLandMetadata] = useState(null)

const loadLandMetadata = async (ipfsHash: string) => {
	try {
		const response = await fetch(getIPFSURL(ipfsHash))
		const metadata = await response.json()
		setLandMetadata(metadata)
	} catch (error) {
		console.error("Failed to load metadata:", error)
	}
}

// In your land display component
{
	landMetadata && (
		<div>
			<h3>{landMetadata.title}</h3>
			<p>{landMetadata.description}</p>
			<p>Address: {landMetadata.property_details?.address}</p>
			<p>Area: {landMetadata.property_details?.area}</p>

			<h4>Documents:</h4>
			<ul>
				<li>
					<a href={getIPFSURL(landMetadata.documents.deed)} target="_blank">
						Deed
					</a>
				</li>
				<li>
					<a href={getIPFSURL(landMetadata.documents.survey)} target="_blank">
						Survey
					</a>
				</li>
				<li>
					<a href={getIPFSURL(landMetadata.documents.photos)} target="_blank">
						Photos
					</a>
				</li>
			</ul>
		</div>
	)
}
```

## 🌍 IPFS Gateway Options

### Public Gateways

- `https://ipfs.io/ipfs/` - Main IPFS gateway
- `https://gateway.pinata.cloud/ipfs/` - Pinata gateway
- `https://cloudflare-ipfs.com/ipfs/` - Cloudflare gateway
- `https://dweb.link/ipfs/` - Protocol Labs gateway

### Private Gateways

You can run your own IPFS gateway for better performance and reliability.

## 🔒 Security Considerations

### 1. Content Verification

```typescript
const verifyContent = async (hash: string, expectedContent: string) => {
	const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
	const content = await response.text()
	const calculatedHash = await ipfs.add(content)
	return calculatedHash.path === hash
}
```

### 2. Pin Important Content

```bash
# Pin content to keep it available
ipfs pin add QmYourHashHere

# List pinned content
ipfs pin ls
```

### 3. Use Multiple Gateways

```typescript
const getIPFSURL = (hash: string, gateway = "ipfs.io") => {
	const gateways = {
		"ipfs.io": "https://ipfs.io/ipfs/",
		pinata: "https://gateway.pinata.cloud/ipfs/",
		cloudflare: "https://cloudflare-ipfs.com/ipfs/",
	}
	return `${gateways[gateway]}${hash}`
}
```

## 📊 Performance Optimization

### 1. Cache Frequently Accessed Content

```typescript
const cache = new Map()

const getCachedContent = async (hash: string) => {
	if (cache.has(hash)) {
		return cache.get(hash)
	}

	const content = await fetch(`https://ipfs.io/ipfs/${hash}`)
	cache.set(hash, content)
	return content
}
```

### 2. Use IPFS Clusters

For production applications, consider using IPFS clusters for better redundancy and performance.

### 3. Preload Important Content

```bash
# Preload content on multiple nodes
ipfs pin add QmYourHashHere
ipfs pin add QmAnotherHashHere
```

## 🚨 Troubleshooting

### Common Issues

1. **Content not accessible**

   - Check if content is pinned
   - Try different gateways
   - Verify the hash is correct

2. **Slow loading**

   - Use multiple gateways
   - Cache content locally
   - Consider running your own IPFS node

3. **Upload failures**
   - Check IPFS daemon is running
   - Verify network connectivity
   - Try different IPFS services

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

## 🎯 Next Steps

1. **Set up IPFS node** on your server
2. **Integrate IPFS upload** in your frontend
3. **Add document validation** for uploaded files
4. **Implement content pinning** for important documents
5. **Add IPFS monitoring** and health checks

## 📚 Additional Resources

- [IPFS Documentation](https://docs.ipfs.io/)
- [IPFS JavaScript Client](https://github.com/ipfs/js-ipfs)
- [IPFS Gateway List](https://ipfs.github.io/public-gateway-checker/)
- [Pinata IPFS Service](https://pinata.cloud/)

This integration will make your Veridia Land Registry more robust, decentralized, and cost-effective!
