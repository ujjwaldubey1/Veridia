# 🌐 Web3.Storage Setup Guide for Veridia Land Registry

## 📋 Overview

This guide shows you how to set up and use Web3.Storage (now Storacha) for decentralized file storage in your Veridia Land Registry project.

## 🎯 Why Web3.Storage?

- **Decentralized**: Files stored on IPFS network
- **Permanent**: Files are backed by Filecoin
- **Simple**: Easy-to-use API
- **Reliable**: No need to run your own IPFS node
- **Cost-effective**: Generous free tier

## 🚀 Quick Setup

### Step 1: Get Web3.Storage API Token

1. **Visit Web3.Storage**: Go to [https://web3.storage](https://web3.storage)
2. **Sign up**: Create an account using email or GitHub
3. **Get API Token**:
   - Go to "Account" → "API Keys"
   - Click "Create API Key"
   - Copy the token (starts with `eyJ...`)

### Step 2: Set Environment Variables

Create a `.env` file in your frontend directory:

```bash
# .env
REACT_APP_WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Install Dependencies

```bash
cd frontend
npm install @storacha/client
```

## 🔧 Integration Examples

### Basic File Upload

```typescript
import { Client } from "@storacha/client"

const client = new Client({
	token: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
})

// Upload a single file
async function uploadFile(file: File) {
	const cid = await client.uploadFile(file)
	console.log("File uploaded:", cid)
	console.log("Access URL:", `https://w3s.link/ipfs/${cid}`)
	return cid
}

// Upload multiple files
async function uploadFiles(files: File[]) {
	const cid = await client.uploadFiles(files)
	console.log("Files uploaded:", cid)
	return cid
}
```

### Land Document Upload

```typescript
// Upload land documents with metadata
async function uploadLandDocuments(documents: {
	deed: File
	survey: File
	photos: File
}) {
	// Upload individual documents
	const deedCid = await client.uploadFile(documents.deed)
	const surveyCid = await client.uploadFile(documents.survey)
	const photosCid = await client.uploadFile(documents.photos)

	// Create metadata
	const metadata = {
		title: "Land Deed for 123 Main St",
		description: "Property in California, USA",
		documents: {
			deed: deedCid,
			survey: surveyCid,
			photos: photosCid,
		},
		uploaded_at: new Date().toISOString(),
	}

	// Upload metadata
	const metadataFile = new File(
		[JSON.stringify(metadata, null, 2)],
		"metadata.json",
		{ type: "application/json" }
	)

	const metadataCid = await client.uploadFile(metadataFile)

	return {
		metadataCid,
		documents: { deedCid, surveyCid, photosCid },
	}
}
```

## 🏗️ Complete Integration

### 1. Update Your Land Registry Hook

```typescript
// useLandRegistryWithStorage.ts
import { Client } from "@storacha/client"

const client = new Client({
	token: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
})

export const useLandRegistryWithStorage = () => {
	// ... existing code ...

	const uploadLandDocuments = async (documents: LandDocument[]) => {
		// Upload documents
		const documentResults = {}
		for (const doc of documents) {
			const cid = await client.uploadFile(doc.file)
			documentResults[doc.type] = cid
		}

		// Create and upload metadata
		const metadata = {
			title: "Land Registry Document",
			documents: documentResults,
			uploaded_at: new Date().toISOString(),
		}

		const metadataFile = new File(
			[JSON.stringify(metadata, null, 2)],
			"land-metadata.json",
			{ type: "application/json" }
		)

		const metadataCid = await client.uploadFile(metadataFile)
		return { metadataCid, documents: documentResults }
	}

	// ... rest of your code ...
}
```

### 2. Update Your React Component

```typescript
// App.tsx
import { useLandRegistryWithStorage } from "./hooks/useLandRegistryWithStorage"

function App() {
	const { registerLandWithDocuments, uploadProgress } =
		useLandRegistryWithStorage()

	const handleRegister = async (formData, files) => {
		try {
			// Upload documents to Web3.Storage
			const uploadResult = await uploadLandDocuments(files)

			// Register land with metadata CID
			await registerLandWithDocuments(
				formData.owner,
				formData.jurisdiction,
				uploadResult.metadataCid
			)

			message.success("Land registered with documents!")
		} catch (error) {
			message.error("Registration failed: " + error.message)
		}
	}

	return (
		<div>
			{/* Your form components */}
			{uploadProgress > 0 && (
				<Progress percent={uploadProgress} status="active" />
			)}
		</div>
	)
}
```

## 📱 Frontend Components

### File Upload Component

```typescript
import { Upload, Button, message } from "antd"
import { UploadOutlined } from "@ant-design/icons"

function FileUpload({ onFileSelect, accept, type }) {
	const handleUpload = (file) => {
		onFileSelect(file, type)
		return false // Prevent default upload
	}

	return (
		<Upload beforeUpload={handleUpload} showUploadList={false} accept={accept}>
			<Button icon={<UploadOutlined />}>Upload {type}</Button>
		</Upload>
	)
}
```

### Document Viewer Component

```typescript
function DocumentViewer({ cid, title }) {
	const url = `https://w3s.link/ipfs/${cid}`

	return (
		<div>
			<h4>{title}</h4>
			<Button href={url} target="_blank" type="link">
				View Document
			</Button>
		</div>
	)
}
```

## 🔍 Retrieving Files

### Get File from Web3.Storage

```typescript
// Get file content
async function getFile(cid: string) {
	const response = await fetch(`https://w3s.link/ipfs/${cid}`)
	return await response.text() // or .blob() for binary files
}

// Get file URL
function getFileUrl(cid: string) {
	return `https://w3s.link/ipfs/${cid}`
}

// Verify file exists
async function verifyFile(cid: string) {
	try {
		const response = await fetch(`https://w3s.link/ipfs/${cid}`, {
			method: "HEAD",
		})
		return response.ok
	} catch {
		return false
	}
}
```

### Load Land Metadata

```typescript
async function loadLandMetadata(landId: number) {
	// Get land info from blockchain
	const landInfo = await getLand(landId)
	if (!landInfo) return null

	// Get metadata from Web3.Storage
	const response = await fetch(
		`https://w3s.link/ipfs/${landInfo.metadata_hash}`
	)
	const metadata = await response.json()
	return metadata
}
```

## 🛡️ Security Best Practices

### 1. Environment Variables

```bash
# .env
REACT_APP_WEB3_STORAGE_TOKEN=your_token_here
```

**Never commit your API token to version control!**

### 2. File Validation

```typescript
function validateFile(file: File, maxSize: number = 10 * 1024 * 1024) {
	if (file.size > maxSize) {
		throw new Error("File too large")
	}

	const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
	if (!allowedTypes.includes(file.type)) {
		throw new Error("Invalid file type")
	}

	return true
}
```

### 3. Error Handling

```typescript
async function uploadWithRetry(file: File, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await client.uploadFile(file)
		} catch (error) {
			if (i === maxRetries - 1) throw error
			await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
		}
	}
}
```

## 📊 Monitoring and Analytics

### Upload Progress

```typescript
const client = new Client({
	token: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
})

// Upload with progress tracking
const cid = await client.uploadFile(file, {
	onUploadProgress: (progress) => {
		console.log(`Upload progress: ${progress.percent}%`)
		setUploadProgress(progress.percent)
	},
})
```

### File Statistics

```typescript
// Get file info
async function getFileInfo(cid: string) {
	const response = await fetch(`https://w3s.link/ipfs/${cid}`)
	return {
		size: response.headers.get("content-length"),
		type: response.headers.get("content-type"),
		lastModified: response.headers.get("last-modified"),
	}
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Upload fails**

   - Check API token is correct
   - Verify file size is within limits
   - Check network connectivity

2. **Files not accessible**

   - Files may take time to propagate
   - Try different IPFS gateways
   - Verify CID is correct

3. **Rate limiting**
   - Web3.Storage has rate limits
   - Implement retry logic
   - Consider batching uploads

### Debug Commands

```typescript
// Check if file exists
async function debugFile(cid: string) {
	try {
		const response = await fetch(`https://w3s.link/ipfs/${cid}`)
		console.log("Status:", response.status)
		console.log("Headers:", response.headers)
		return response.ok
	} catch (error) {
		console.error("Error:", error)
		return false
	}
}
```

## 🎯 Next Steps

1. **Set up Web3.Storage account** and get API token
2. **Update environment variables** with your token
3. **Test file uploads** with the provided examples
4. **Integrate with your land registry** using the hooks
5. **Add file validation** and error handling
6. **Implement progress tracking** for better UX

## 📚 Additional Resources

- [Web3.Storage Documentation](https://web3.storage/docs/)
- [Storacha Client Documentation](https://github.com/storacha/client)
- [IPFS Gateway List](https://ipfs.github.io/public-gateway-checker/)
- [Filecoin Documentation](https://docs.filecoin.io/)

This integration will make your Veridia Land Registry truly decentralized with permanent, tamper-proof document storage! 🏗️✨
