# Veridia Land Registry - Frontend Integration Guide

## 🏗️ Smart Contract Overview

The Veridia Land Registry is a decentralized land registration system built on Aptos blockchain. This guide provides everything frontend developers need to integrate with the smart contract.

## 📋 Quick Reference

### Contract Details

- **Network**: Aptos Devnet
- **Contract Address**: `0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17`
- **Module Name**: `land_registry`
- **Package Name**: `veridia`

### Explorer Links

- [Contract on Aptos Explorer](https://explorer.aptoslabs.com/account/0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17?network=devnet)
- [Deployed Package](https://explorer.aptoslabs.com/account/0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17/modules?network=devnet)

## 🚀 Getting Started

### Prerequisites

1. **Aptos Wallet Integration**

   - [Petra Wallet](https://petra.app/) (Recommended)
   - [Martian Wallet](https://martianwallet.xyz/)
   - [Pontem Wallet](https://pontem.network/wallet)

2. **Required NPM Packages**

   ```bash
   npm install @aptos-labs/ts-sdk
   npm install @aptos-labs/wallet-adapter-react
   npm install @aptos-labs/wallet-adapter-ant-design
   ```

3. **TypeScript Setup**
   ```bash
   npm install typescript @types/node
   ```

## 🔧 Smart Contract API

### Data Structures

#### Land Object

```typescript
interface Land {
	id: string // u64 as string
	owner: string // address
	jurisdiction: string // string
	metadata_hash: string // string (IPFS/Arweave hash)
	status: {
		value: number // u8: 0=Active, 1=Frozen, 2=Disputed
	}
	registered_at: string // u64 timestamp in microseconds
}
```

#### Status Enum

```typescript
enum LandStatus {
	ACTIVE = 0,
	FROZEN = 1,
	DISPUTED = 2,
}
```

### Entry Functions (Write Operations)

#### 1. Initialize Registry

```typescript
// Only needs to be called once by contract owner
const payload = {
	type: "entry_function_payload",
	function:
		"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::initialize",
	arguments: [],
	type_arguments: [],
}
```

#### 2. Register Land

```typescript
const registerLand = (
	ownerAddress: string,
	jurisdiction: string,
	metadataHash: string
) => ({
	type: "entry_function_payload",
	function:
		"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::register_land",
	arguments: [
		ownerAddress, // address
		jurisdiction, // string
		metadataHash, // string (IPFS hash)
	],
	type_arguments: [],
})
```

#### 3. Transfer Ownership

```typescript
const transferOwnership = (landId: number, newOwnerAddress: string) => ({
	type: "entry_function_payload",
	function:
		"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::transfer_ownership",
	arguments: [
		landId.toString(), // u64 as string
		newOwnerAddress, // address
	],
	type_arguments: [],
})
```

#### 4. Update Status

```typescript
const updateStatus = (landId: number, newStatus: LandStatus) => ({
	type: "entry_function_payload",
	function:
		"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::update_status",
	arguments: [
		landId.toString(), // u64 as string
		newStatus.toString(), // u8 as string
	],
	type_arguments: [],
})
```

### View Functions (Read Operations)

#### 1. Get Land Information

```typescript
const getLand = async (client: AptosClient, landId: number): Promise<Land> => {
	const payload = {
		function:
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land",
		arguments: [
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17", // registry address
			landId.toString(),
		],
		type_arguments: [],
	}

	const result = await client.view(payload)
	return result[0] as Land
}
```

#### 2. Check if Land Exists

```typescript
const landExists = async (
	client: AptosClient,
	landId: number
): Promise<boolean> => {
	const payload = {
		function:
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::land_exists",
		arguments: [
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
			landId.toString(),
		],
		type_arguments: [],
	}

	const result = await client.view(payload)
	return result[0] as boolean
}
```

#### 3. Get Next Land ID

```typescript
const getNextLandId = async (client: AptosClient): Promise<number> => {
	const payload = {
		function:
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_next_land_id",
		arguments: [
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
		],
		type_arguments: [],
	}

	const result = await client.view(payload)
	return parseInt(result[0] as string)
}
```

#### 4. Get Land Owner

```typescript
const getLandOwner = async (
	client: AptosClient,
	landId: number
): Promise<string> => {
	const payload = {
		function:
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner",
		arguments: [
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
			landId.toString(),
		],
		type_arguments: [],
	}

	const result = await client.view(payload)
	return result[0] as string
}
```

#### 5. Get Land Status

```typescript
const getLandStatus = async (
	client: AptosClient,
	landId: number
): Promise<LandStatus> => {
	const payload = {
		function:
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status",
		arguments: [
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
			landId.toString(),
		],
		type_arguments: [],
	}

	const result = await client.view(payload)
	return parseInt(result[0] as string) as LandStatus
}
```

## 🔗 Complete Integration Example

### React Hook for Land Registry

```typescript
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AptosClient } from "@aptos-labs/ts-sdk"

const APTOS_CLIENT = new AptosClient("https://fullnode.devnet.aptoslabs.com")
const REGISTRY_ADDRESS =
	"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"

export const useLandRegistry = () => {
	const { signAndSubmitTransaction } = useWallet()

	// Register new land
	const registerLand = async (
		ownerAddress: string,
		jurisdiction: string,
		metadataHash: string
	) => {
		const payload = {
			type: "entry_function_payload",
			function: `${REGISTRY_ADDRESS}::land_registry::register_land`,
			arguments: [ownerAddress, jurisdiction, metadataHash],
			type_arguments: [],
		}

		try {
			const response = await signAndSubmitTransaction(payload)
			await APTOS_CLIENT.waitForTransaction(response.hash)
			return response
		} catch (error) {
			console.error("Failed to register land:", error)
			throw error
		}
	}

	// Transfer ownership
	const transferOwnership = async (landId: number, newOwner: string) => {
		const payload = {
			type: "entry_function_payload",
			function: `${REGISTRY_ADDRESS}::land_registry::transfer_ownership`,
			arguments: [landId.toString(), newOwner],
			type_arguments: [],
		}

		try {
			const response = await signAndSubmitTransaction(payload)
			await APTOS_CLIENT.waitForTransaction(response.hash)
			return response
		} catch (error) {
			console.error("Failed to transfer ownership:", error)
			throw error
		}
	}

	// Update land status
	const updateLandStatus = async (landId: number, status: LandStatus) => {
		const payload = {
			type: "entry_function_payload",
			function: `${REGISTRY_ADDRESS}::land_registry::update_status`,
			arguments: [landId.toString(), status.toString()],
			type_arguments: [],
		}

		try {
			const response = await signAndSubmitTransaction(payload)
			await APTOS_CLIENT.waitForTransaction(response.hash)
			return response
		} catch (error) {
			console.error("Failed to update status:", error)
			throw error
		}
	}

	// Get land information
	const getLand = async (landId: number): Promise<Land | null> => {
		try {
			const payload = {
				function: `${REGISTRY_ADDRESS}::land_registry::get_land`,
				arguments: [REGISTRY_ADDRESS, landId.toString()],
				type_arguments: [],
			}

			const result = await APTOS_CLIENT.view(payload)
			return result[0] as Land
		} catch (error) {
			console.error("Failed to get land:", error)
			return null
		}
	}

	// Check if land exists
	const checkLandExists = async (landId: number): Promise<boolean> => {
		try {
			const payload = {
				function: `${REGISTRY_ADDRESS}::land_registry::land_exists`,
				arguments: [REGISTRY_ADDRESS, landId.toString()],
				type_arguments: [],
			}

			const result = await APTOS_CLIENT.view(payload)
			return result[0] as boolean
		} catch (error) {
			console.error("Failed to check land existence:", error)
			return false
		}
	}

	return {
		registerLand,
		transferOwnership,
		updateLandStatus,
		getLand,
		checkLandExists,
	}
}
```

### React Component Example

```typescript
import React, { useState, useEffect } from "react"
import { useLandRegistry } from "./hooks/useLandRegistry"

const LandRegistryApp: React.FC = () => {
	const [landId, setLandId] = useState<number>(1)
	const [landData, setLandData] = useState<Land | null>(null)
	const [loading, setLoading] = useState(false)

	const {
		registerLand,
		transferOwnership,
		updateLandStatus,
		getLand,
		checkLandExists,
	} = useLandRegistry()

	// Load land data
	const loadLand = async () => {
		setLoading(true)
		try {
			const exists = await checkLandExists(landId)
			if (exists) {
				const data = await getLand(landId)
				setLandData(data)
			} else {
				setLandData(null)
			}
		} catch (error) {
			console.error("Error loading land:", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadLand()
	}, [landId])

	// Register new land
	const handleRegisterLand = async () => {
		try {
			await registerLand(
				"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
				"California, USA",
				"QmExampleHashForLandDocument"
			)
			alert("Land registered successfully!")
			loadLand() // Reload data
		} catch (error) {
			alert("Failed to register land")
		}
	}

	// Transfer ownership
	const handleTransferOwnership = async () => {
		try {
			await transferOwnership(
				landId,
				"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
			)
			alert("Ownership transferred successfully!")
			loadLand() // Reload data
		} catch (error) {
			alert("Failed to transfer ownership")
		}
	}

	// Update status
	const handleUpdateStatus = async (status: LandStatus) => {
		try {
			await updateLandStatus(landId, status)
			alert("Status updated successfully!")
			loadLand() // Reload data
		} catch (error) {
			alert("Failed to update status")
		}
	}

	return (
		<div className="land-registry-app">
			<h1>Veridia Land Registry</h1>

			<div>
				<label>
					Land ID:
					<input
						type="number"
						value={landId}
						onChange={(e) => setLandId(parseInt(e.target.value))}
					/>
				</label>
				<button onClick={loadLand} disabled={loading}>
					{loading ? "Loading..." : "Load Land"}
				</button>
			</div>

			{landData ? (
				<div className="land-info">
					<h2>Land Information</h2>
					<p>
						<strong>ID:</strong> {landData.id}
					</p>
					<p>
						<strong>Owner:</strong> {landData.owner}
					</p>
					<p>
						<strong>Jurisdiction:</strong> {landData.jurisdiction}
					</p>
					<p>
						<strong>Metadata Hash:</strong> {landData.metadata_hash}
					</p>
					<p>
						<strong>Status:</strong>{" "}
						{landData.status.value === 0
							? "Active"
							: landData.status.value === 1
							? "Frozen"
							: "Disputed"}
					</p>
					<p>
						<strong>Registered At:</strong>{" "}
						{new Date(parseInt(landData.registered_at) / 1000).toLocaleString()}
					</p>

					<div className="actions">
						<button onClick={handleTransferOwnership}>
							Transfer Ownership
						</button>
						<button onClick={() => handleUpdateStatus(LandStatus.FROZEN)}>
							Freeze Land
						</button>
						<button onClick={() => handleUpdateStatus(LandStatus.DISPUTED)}>
							Mark as Disputed
						</button>
						<button onClick={() => handleUpdateStatus(LandStatus.ACTIVE)}>
							Activate Land
						</button>
					</div>
				</div>
			) : (
				<div>
					<p>Land ID {landId} does not exist.</p>
					<button onClick={handleRegisterLand}>Register New Land</button>
				</div>
			)}
		</div>
	)
}

export default LandRegistryApp
```

## 📋 Events to Listen For

The smart contract emits the following events that you can listen to:

### 1. LandRegisteredEvent

```typescript
interface LandRegisteredEvent {
	land_id: string
	owner: string
	jurisdiction: string
	metadata_hash: string
	timestamp: string
}
```

### 2. StatusChangedEvent

```typescript
interface StatusChangedEvent {
	land_id: string
	old_status: number
	new_status: number
	changed_by: string
	timestamp: string
}
```

### 3. OwnershipTransferredEvent

```typescript
interface OwnershipTransferredEvent {
	land_id: string
	old_owner: string
	new_owner: string
	transferred_by: string
	timestamp: string
}
```

## 🔍 Event Listening Example

```typescript
import { AptosClient } from "@aptos-labs/ts-sdk"

const client = new AptosClient("https://fullnode.devnet.aptoslabs.com")

// Listen for events
const listenForEvents = async () => {
	try {
		// Get events for the registry account
		const events = await client.getEventsByEventHandle(
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
			"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::LandRegistry",
			"land_registered_events"
		)

		console.log("Land registered events:", events)
	} catch (error) {
		console.error("Error fetching events:", error)
	}
}
```

## 🚨 Error Handling

### Common Error Codes

```typescript
const ERROR_CODES = {
	E_NOT_AUTHORIZED: 1, // User not authorized
	E_LAND_NOT_FOUND: 2, // Land ID doesn't exist
	E_LAND_ALREADY_EXISTS: 3, // Land ID already exists
	E_INVALID_STATUS: 4, // Invalid status value
	E_REGISTRY_NOT_INITIALIZED: 5, // Registry not initialized
}
```

### Error Handling Example

```typescript
const handleTransaction = async (transactionFunction: () => Promise<any>) => {
	try {
		const result = await transactionFunction()
		return { success: true, data: result }
	} catch (error: any) {
		// Parse Aptos error
		if (error.message?.includes("E_LAND_NOT_FOUND")) {
			return { success: false, error: "Land not found" }
		} else if (error.message?.includes("E_INVALID_STATUS")) {
			return { success: false, error: "Invalid status value" }
		} else if (error.message?.includes("E_REGISTRY_NOT_INITIALIZED")) {
			return { success: false, error: "Registry not initialized" }
		} else {
			return { success: false, error: "Transaction failed" }
		}
	}
}
```

## 🎨 UI/UX Considerations

### Status Display

```typescript
const getStatusDisplay = (status: number) => {
	switch (status) {
		case 0:
			return { text: "Active", color: "green", icon: "✅" }
		case 1:
			return { text: "Frozen", color: "orange", icon: "🧊" }
		case 2:
			return { text: "Disputed", color: "red", icon: "⚠️" }
		default:
			return { text: "Unknown", color: "gray", icon: "❓" }
	}
}
```

### Form Validation

```typescript
const validateLandRegistration = (data: {
	owner: string
	jurisdiction: string
	metadataHash: string
}) => {
	const errors: string[] = []

	if (!data.owner || data.owner.length !== 66) {
		errors.push("Valid owner address required")
	}

	if (!data.jurisdiction || data.jurisdiction.length < 3) {
		errors.push("Jurisdiction must be at least 3 characters")
	}

	if (!data.metadataHash || !data.metadataHash.startsWith("Qm")) {
		errors.push("Valid IPFS hash required (starts with 'Qm')")
	}

	return errors
}
```

## 🔐 Security Best Practices

1. **Address Validation**: Always validate Aptos addresses (64 characters, hex)
2. **Input Sanitization**: Sanitize all user inputs before sending to contract
3. **Transaction Simulation**: Use simulation before actual transactions
4. **Error Handling**: Implement comprehensive error handling
5. **User Permissions**: Check if user owns land before allowing modifications

## 🚀 Deployment Configuration

### Environment Variables

```typescript
// config.ts
export const config = {
	APTOS_NETWORK: process.env.REACT_APP_APTOS_NETWORK || "devnet",
	APTOS_NODE_URL:
		process.env.REACT_APP_APTOS_NODE_URL ||
		"https://fullnode.devnet.aptoslabs.com",
	REGISTRY_ADDRESS:
		"0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
}
```

### Network Configuration

```typescript
const networks = {
	devnet: {
		nodeUrl: "https://fullnode.devnet.aptoslabs.com",
		faucetUrl: "https://faucet.devnet.aptoslabs.com",
	},
	testnet: {
		nodeUrl: "https://fullnode.testnet.aptoslabs.com",
		faucetUrl: "https://faucet.testnet.aptoslabs.com",
	},
	mainnet: {
		nodeUrl: "https://fullnode.mainnet.aptoslabs.com",
		faucetUrl: null,
	},
}
```

## 📖 Additional Resources

- [Aptos TypeScript SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Aptos Wallet Adapter](https://github.com/aptos-labs/aptos-wallet-adapter)
- [Aptos Explorer](https://explorer.aptoslabs.com/)
- [Move Language Documentation](https://move-language.github.io/move/)

## 💡 Tips for Frontend Development

1. **Caching**: Cache view function results to reduce API calls
2. **Pagination**: Implement pagination for large land lists
3. **Real-time Updates**: Poll for events or use websockets for real-time updates
4. **Offline Support**: Cache essential data for offline viewing
5. **Mobile Responsive**: Ensure mobile wallet compatibility

## 🐛 Testing

### Unit Tests Example

```typescript
// __tests__/landRegistry.test.ts
describe("Land Registry Integration", () => {
	test("should register land successfully", async () => {
		// Test land registration
	})

	test("should transfer ownership", async () => {
		// Test ownership transfer
	})

	test("should update status", async () => {
		// Test status updates
	})
})
```

---

**Happy Building! 🏗️**

For questions or support, please refer to the smart contract documentation or create an issue in the repository.
