# QR Code Generation Fix

## Problem

QR code was not generating after successful land registration on the blockchain.

## Root Cause

The QR code generation had several timing and validation issues:

1. Land ID calculation was happening too quickly after transaction
2. No console logging for debugging
3. No error handling in QR code generation
4. Modal wasn't handling loading states properly

## Fixes Applied

### 1. Added Transaction Settlement Delay

```typescript
// Wait a moment for transaction to settle
await new Promise((resolve) => setTimeout(resolve, 1000))
```

### 2. Improved Land ID Calculation

```typescript
const currentNextId = await getNextLandId()
const registeredLandId = currentNextId - 1
```

### 3. Added Console Logging

```typescript
console.log("Transaction hash:", tx.hash)
console.log("Next Land ID:", currentNextId)
console.log("Registered Land ID:", registeredLandId)
console.log("QR Data:", verificationData)
console.log("Generated verification URL:", url)
```

### 4. Added Error Handling

```typescript
try {
	// Generate QR code
} catch (error) {
	console.error("Error generating QR code:", error)
	message.error("Failed to generate QR code")
}
```

### 5. Improved Modal Rendering

- Added `destroyOnClose` prop
- Added loading state display
- Better conditional rendering

### 6. Enhanced QR Component

- Conditional rendering when URL is not ready
- Loading placeholder
- Error messages

## Testing

1. Register a new land
2. Check browser console for logs
3. Verify QR code appears in modal
4. Test downloading and copying QR code

## Expected Behavior

1. Land registration succeeds
2. Transaction hash is logged
3. Land ID is calculated correctly
4. QR data is created
5. Modal opens with QR code
6. User can download/copy QR code
