# Veridia Land Registry - Deployment Summary

**Date**: January 2025  
**Network**: Aptos Devnet  
**Status**: ✅ Successfully Deployed

## 🎯 Deployment Details

### Contract Information

- **Registry Address**: `0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17`
- **Module Name**: `land_registry`
- **Network**: Devnet
- **Transaction Hash**: `0x0acdbc380c0b7e0a0265ed7368637fd81ef0f124a9155714b3ac1aaaf419010f`
- **Explorer**: https://explorer.aptoslabs.com/txn/0x0acdbc380c0b7e0a0265ed7368637fd81ef0f124a9155714b3ac1aaaf419010f?network=devnet

### Configuration Files Updated

1. ✅ `Move.toml` - Updated address to match published account
2. ✅ `frontend/.env` - Created with correct network and contract details
3. ✅ `frontend/src/useLandRegistry.ts` - Fixed transferOwnership function
4. ✅ `frontend/src/App.tsx` - Added "Get APT" button for users

### Account Status

- **Balance**: ~0.40 APT (399,550,100 Octas)
- **Registry Status**: Initialized ✅
- **Function**: Ready to use

## 📋 What Was Fixed

### 1. Module Not Found Error

**Problem**: Frontend was showing "Module not found" error  
**Solution**:

- Republished module to devnet
- Updated Move.toml address configuration
- Created frontend/.env with correct contract address

### 2. Transfer Ownership Bug

**Problem**: transferOwnership function was missing required `registry_addr` parameter  
**Solution**: Updated the function call to include the registry address as the first argument

### 3. Insufficient APT Error

**Problem**: Users connecting wallets don't have APT for transactions  
**Solution**: Added "Get APT" button in the frontend that opens the faucet

### 4. Web Faucet Not Working

**Problem**: Faucet UI showing only "tap:ok" with no input field  
**Solution**: Used CLI command `aptos account fund-with-faucet` to request APT

## 🚀 How to Use

### Start the Frontend

```bash
cd frontend
npm run dev
```

### Request APT for Your Wallet

1. Connect your wallet in the app (Petra, Martian, etc.)
2. Click the "Get APT" button in the header
3. This will open the faucet with your address pre-filled
4. Alternatively, visit: https://faucet.devnet.aptoslabs.com/?address=YOUR_ADDRESS

### Or Use CLI

```bash
aptos account fund-with-faucet --account default --amount 100000000000
```

## 📝 Frontend Environment Variables

```bash
VITE_APTOS_NETWORK=devnet
VITE_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com
VITE_REGISTRY_ADDRESS=0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
VITE_MODULE_NAME=land_registry
```

## ✅ Verification

Module is live and accessible at:

```
https://fullnode.devnet.aptoslabs.com/v1/accounts/0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17/module/land_registry
```

Registry is initialized and ready to accept land registrations.

## 🎉 Next Steps

1. Start the frontend: `cd frontend && npm run dev`
2. Connect your wallet
3. Click "Get APT" if you need funds
4. Register your first land!

---

**All tasks completed successfully!** ✨
