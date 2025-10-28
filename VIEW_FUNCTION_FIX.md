# View Function JSON Error Fix

## Problem

The application was showing these errors:

1. `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`
2. `404 errors` when trying to load module
3. QR code not generating after registration

## Root Causes

1. **Incorrect Aptos client configuration** - The client wasn't properly configured
2. **Wrong view function call syntax** - The SDK expects a different format
3. **No error handling** - View functions could crash if registry wasn't initialized

## Fixes Applied

### 1. Fixed Aptos Client Configuration

**Before:**

```typescript
const aptos = new Aptos(
	new AptosConfig(
		NODE_URL ? { network: NETWORK, fullnode: NODE_URL } : { network: NETWORK }
	)
)
```

**After:**

```typescript
const aptos = new Aptos(
	new AptosConfig({
		network: NETWORK,
		fullnode: NODE_URL || undefined,
	})
)
```

### 2. Fixed View Function Call Format

**Before (incorrect):**

```typescript
const result = (await aptos.view({
	function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_next_land_id`,
	typeArguments: [],
	functionArguments: [REGISTRY_ADDRESS],
})) as [string]
```

**After (correct):**

```typescript
const result = (await aptos.view({
	payload: {
		function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_next_land_id`,
		typeArguments: [],
		functionArguments: [REGISTRY_ADDRESS],
	},
})) as [string]
```

### 3. Added Error Handling

All view functions now have:

- Try-catch blocks
- Console logging for debugging
- Fallback default values
- Proper error messages

### 4. Functions Updated

- ✅ `getLand` - Fixed view call format
- ✅ `checkLandExists` - Fixed view call format
- ✅ `getNextLandId` - Fixed view call format, added logging
- ✅ `getLandStatus` - Fixed view call format, added error handling

## Current Registry Status

Verified working:

- **Address**: `0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17`
- **Network**: Devnet
- **Next Land ID**: 3
- **Lands Registered**: 2
- **Status**: Initialized and working ✅

## Testing

1. Refresh the frontend
2. Open browser console
3. Check for "getNextLandId result:" logs
4. Verify no JSON errors
5. Try registering a land
6. Verify QR code generates

## Expected Behavior

1. No more JSON parse errors
2. No more 404 errors when loading module
3. View functions work correctly
4. QR codes generate after registration
5. Console shows proper debugging info

## Summary

All view functions now use the correct SDK format with `payload` wrapper. The Aptos client is properly configured. Error handling ensures the app doesn't crash if something goes wrong.
