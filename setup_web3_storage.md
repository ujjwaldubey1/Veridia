# 🚀 Web3.Storage Setup Instructions

## ✅ You're Almost There!

You have successfully:

- ✅ Created a Web3.Storage account
- ✅ Got your DID: `z6Mktmi8U1pJD3hXWrB3HfVw8q5azxPHn9DoNUuGqP5wPiSN`
- ✅ Installed the Storacha client

## 🔑 Next Steps:

### 1. Get Your API Token

In your Web3.Storage dashboard:

1. Look for "API Keys" or "Settings" section
2. Click "Create API Key" or "Generate Token"
3. Copy the token (starts with `eyJ...`)

### 2. Create Environment File

Create a file called `.env` in your `frontend` directory with this content:

```bash
# Web3.Storage Configuration
VITE_WEB3_STORAGE_TOKEN=your_actual_api_token_here

# Aptos Network Configuration
VITE_APTOS_NETWORK=devnet
VITE_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com

# Registry Configuration
VITE_REGISTRY_ADDRESS=0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
VITE_MODULE_NAME=land_registry
```

### 3. Test the Integration

Run this command to test Web3.Storage:

```bash
cd frontend
npm run test:storage
```

### 4. Start Your App

```bash
npm run dev
```

## 🎯 What You Can Do Now:

1. **Upload land documents** to IPFS via Web3.Storage
2. **Store metadata** as JSON files
3. **Register lands** with document hashes
4. **View documents** through IPFS gateways

## 🔍 Your DID Explained:

- **DID**: `z6Mktmi8U1pJD3hXWrB3HfVw8q5azxPHn9DoNUuGqP5wPiSN`
- **Purpose**: Your unique identifier in the Web3.Storage network
- **Usage**: Used for authentication and file management

## 📱 Ready to Use:

Once you have your API token, you can:

- Use `AppWithWeb3Storage.tsx` for the full experience
- Upload files with progress tracking
- Store land documents permanently on IPFS
- Access documents from anywhere in the world

## 🆘 Need Help?

If you can't find the API token:

1. Look for "API Keys" in the sidebar
2. Check "Account Settings"
3. Look for "Developer" or "Integration" section
4. The token should be a long string starting with `eyJ`

Let me know when you have your API token and I'll help you test the integration! 🚀

