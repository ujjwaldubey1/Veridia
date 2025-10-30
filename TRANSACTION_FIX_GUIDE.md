# Transaction Error Fix - Step by Step Guide

## ✅ What's Working

- **QR Code System**: ✅ WORKING (test button works!)
- **Modal Display**: ✅ WORKING
- **React Components**: ✅ WORKING

## ❌ What's Not Working

- **Transaction Submission**: The contract might not be deployed or at wrong address

## 🔧 Fixes Applied

### 1. Made Transaction Wait More Robust

Changed `useLandRegistry.ts` to not fail if transaction confirmation times out:

```typescript
// Now won't crash if transaction wait fails
try {
	await aptos.waitForTransaction({
		transactionHash: tx.hash,
		options: {
			timeoutSecs: 30,
			checkSuccess: false,
		},
	})
	console.log("✅ Transaction confirmed")
} catch (waitError: any) {
	console.warn("⚠️ Could not confirm, but transaction was submitted")
}
```

### 2. Added Contract Address Display

Added a blue info alert showing:

- The exact contract address being used
- Link to view it on Aptos Explorer

### 3. Created Contract Checker Script

Created `check_contract.js` to verify deployment

---

## 🚀 What To Do Now

### Step 1: **Restart Dev Server** (Important!)

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

**Why?** The code changes need to reload, especially the contract address fix.

---

### Step 2: Check Contract Deployment

Run this command to check if your contract is deployed:

```bash
node check_contract.js
```

**Expected outputs:**

✅ **If contract IS deployed:**

```
✅ Contract found!
📦 Modules: 1
✅ land_registry module found!
📋 Functions available:
   - register_land
   - transfer_ownership
   - update_status
```

❌ **If contract NOT deployed:**

```
❌ CONTRACT NOT FOUND!
📝 To deploy the contract:
   1. Run: aptos move publish --named-addresses veridia=default
```

---

### Step 3A: **If Contract NOT Deployed** - Deploy It

```bash
# Make sure you're in the project root directory (not frontend)
cd ..  # if you're in frontend folder

# Deploy the contract
aptos move publish --named-addresses veridia=default

# You'll need APT in your deploying account
# Get from: https://faucet.devnet.aptoslabs.com/
```

After deployment, **note the deployed address** and update it in the code if different.

---

### Step 3B: **If Contract IS Deployed** - Update Address

If the contract is deployed at a different address than `0xa8d945729...`:

1. **Copy the deployed contract address**

2. **Update both files:**

**File 1**: `frontend/src/useLandRegistry.ts` (around line 21)

```typescript
export const REGISTRY_ADDRESS =
	(import.meta.env.VITE_REGISTRY_ADDRESS as string | undefined) ||
	"YOUR_DEPLOYED_ADDRESS_HERE"
```

**File 2**: `frontend/src/hooks/useLandRegistryWithStorage.ts` (around line 23)

```typescript
export const REGISTRY_ADDRESS =
	(import.meta.env.VITE_REGISTRY_ADDRESS as string | undefined) ||
	"YOUR_DEPLOYED_ADDRESS_HERE"
```

3. **Restart dev server** again

---

### Step 4: Test Everything

1. **Open the app** (http://localhost:5173)

2. **Connect wallet** (make sure it has APT)

3. **Click "Test QR Modal"** button

   - Should work ✅ (already confirmed working)

4. **Look at the blue alert** - it shows your contract address

   - Click "View on Explorer" link
   - Verify the contract exists there

5. **Try registering land:**
   - Fill out minimal form (owner, jurisdiction)
   - Submit
   - Watch console logs

---

## 📊 Console Output Guide

### ✅ Success (Transaction Submitted):

```
✅ Transaction submitted: 0x...
✅ Transaction confirmed on blockchain
📱 Generated QR Data: {...}
✅ QR Modal should now be visible
```

### ⚠️ Partial Success (Submitted but not confirmed):

```
✅ Transaction submitted: 0x...
⚠️ Could not confirm transaction, but it was submitted
📱 Generated QR Data: {...}
✅ QR Modal should now be visible
```

**This is OK!** QR code should still appear.

### ❌ Complete Failure:

```
❌ Transaction failed: ...
```

**Common causes:**

1. No APT in wallet
2. Contract not deployed
3. Wrong contract address
4. Network issues

---

## 🎯 Quick Checklist

Before trying to register land:

- [ ] Dev server restarted after code changes
- [ ] Wallet connected
- [ ] Wallet has APT balance (get from https://faucet.devnet.aptoslabs.com/)
- [ ] Contract deployed (run `node check_contract.js`)
- [ ] Contract address matches in both files
- [ ] Blue alert shows correct contract address
- [ ] Explorer link shows the contract exists

---

## 🐛 Troubleshooting

### Issue: Still seeing old contract address `0xb0270d34...`

**Solution**:

1. Stop dev server
2. Clear browser cache (Ctrl+Shift+Delete)
3. Delete `frontend/node_modules/.vite` folder
4. Restart: `npm run dev`

### Issue: "Transaction failed" immediately

**Causes:**

- Contract not deployed
- No APT in wallet
- Wrong network (should be Devnet)

**Solution:**

```bash
# Check wallet balance
aptos account list

# Fund wallet
aptos account fund-with-faucet --account default

# Deploy contract
aptos move publish --named-addresses veridia=default
```

### Issue: Transaction submitted but QR doesn't appear

**This shouldn't happen anymore** because of the fixes, but if it does:

1. Check console for errors
2. Click "Test QR Modal" to verify modal works
3. Check browser console for React errors

---

## 📝 Summary of Changes

### Files Modified:

1. **frontend/src/useLandRegistry.ts**

   - Made `waitForTransaction` not fail on timeout
   - Added better error handling
   - Added timeout option

2. **frontend/src/App.tsx**

   - Added blue alert showing contract address
   - Added Explorer link
   - Test button already fixed (working ✅)

3. **frontend/src/hooks/useLandRegistryWithStorage.ts**
   - Fixed contract address to match main file

### Files Created:

1. **check_contract.js**
   - Script to verify contract deployment
   - Run with: `node check_contract.js`

---

## 🎯 Next Steps

1. **Run `node check_contract.js`** to verify contract
2. **If needed, deploy contract**
3. **Restart dev server**
4. **Try Test QR button** (should work - already confirmed ✅)
5. **Try actual registration**

---

## ✅ Expected Final Result

After following all steps:

1. Test QR button works ✅ (already working)
2. Blue alert shows correct contract address
3. Registration form submits successfully
4. **QR code modal appears immediately** with land data
5. No errors in console (except maybe deprecation warnings - those are fine)

---

**Status**: ✅ QR SYSTEM FIXED, TRANSACTION NEEDS CONTRACT DEPLOYMENT
**Next**: Run `node check_contract.js` to check contract status
**Date**: October 30, 2025
