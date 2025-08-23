# Veridia Land Registry - Deployment & Testing Guide

## Prerequisites

1. **Install Aptos CLI**: Follow the [official installation guide](https://aptos.dev/tools/install-cli/)
2. **Verify installation**: `aptos --version`
3. **Fund your account**: The account is already configured for devnet in `.aptos/config.yaml`

## Project Structure

```
Veridia/
├── Move.toml                    # Package configuration
├── sources/
│   └── land_registry.move      # Main smart contract
├── tests/
│   └── land_registry_tests.move # Unit tests
└── .aptos/
    └── config.yaml             # Aptos CLI configuration
```

## Testing the Contract

### 1. Run Unit Tests

```bash
# Run all tests
aptos move test

# Run specific test
aptos move test --filter test_register_land

# Run tests with coverage
aptos move test --coverage
```

### 2. Build the Package

```bash
# Compile the Move package
aptos move compile

# Compile and check for errors
aptos move compile --save-metadata
```

## Deployment

### 1. Fund Your Account (if needed)

```bash
# Check account balance
aptos account lookup-address

# Fund account (devnet only)
aptos account fund-with-faucet --account 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

### 2. Publish the Module

```bash
# Publish to devnet
aptos move publish

# Publish with gas options
aptos move publish --max-gas 100000 --gas-unit-price 100
```

## Contract Interaction

### 1. Initialize the Registry

**⚠️ Important**: Run this ONLY ONCE after deployment.

```bash
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::initialize
```

### 2. Register Land

```bash
# Register a new land parcel
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::register_land \
  --args address:0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456 \
         string:"California, USA" \
         string:"QmHash123456789abcdefghijklmnopqrstuvwxyz"

# Example with different parameters
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::register_land \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 \
         string:"New York, USA" \
         string:"QmAnotherHashExample123456789"
```

### 3. Transfer Ownership

```bash
# Transfer land ownership (land_id=1 to new owner)
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::transfer_ownership \
  --args u64:1 \
         address:0x456789abcdef456789abcdef456789abcdef456789abcdef456789abcdef456789
```

### 4. Update Land Status

```bash
# Status values: 0=Active, 1=Frozen, 2=Disputed

# Set land to Frozen status
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::update_status \
  --args u64:1 u8:1

# Set land to Disputed status
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::update_status \
  --args u64:1 u8:2

# Set land back to Active status
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::update_status \
  --args u64:1 u8:0
```

## Querying Data

### 1. View Land Information

```bash
# Get complete land information
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# Check if land exists
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::land_exists \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# Get land owner
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_owner \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# Get land status
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land_status \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# Get next land ID that will be assigned
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_next_land_id \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

### 2. View Account Resources

```bash
# View all resources for the registry account
aptos account lookup-address --account 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17

# View specific LandRegistry resource
aptos account resource \
  --resource-type 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::LandRegistry \
  --account 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

## Event Monitoring

Events are automatically emitted for:

- **LandRegistered**: When new land is registered
- **StatusChanged**: When land status is updated
- **OwnershipTransferred**: When ownership is transferred

You can view events using:

```bash
# View account events
aptos account events --account 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17
```

## Example Workflow

Here's a complete example workflow:

```bash
# 1. Initialize registry (run once)
aptos move run --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::initialize

# 2. Register first land
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::register_land \
  --args address:0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
         string:"California, USA" \
         string:"QmSampleHashForLandDocument123456789"

# 3. Verify registration
aptos move view \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::get_land \
  --args address:0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17 u64:1

# 4. Update status to frozen
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::update_status \
  --args u64:1 u8:1

# 5. Transfer ownership
aptos move run \
  --function-id 0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17::land_registry::transfer_ownership \
  --args u64:1 address:0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

## Status Reference

- **0**: Active - Land is available for normal operations
- **1**: Frozen - Land transactions are temporarily suspended
- **2**: Disputed - Land ownership or boundaries are under dispute

## Security Notes

- The current implementation allows the registry owner to transfer any land
- In production, consider adding proper authorization checks
- The metadata hash should point to immutable storage (IPFS/Arweave)
- Consider adding role-based access control for different operations

## Troubleshooting

**Common Issues:**

1. **"Resource not found"**: Make sure to run `initialize` first
2. **"Land not found"**: Verify the land ID exists using `land_exists`
3. **"Invalid status"**: Use only 0, 1, or 2 for status values
4. **Gas errors**: Increase `--max-gas` parameter

**Getting Help:**

- Check transaction status: `aptos transaction lookup-by-version <version>`
- View account info: `aptos account lookup-address --account <address>`
- View gas estimation: `aptos move publish --simulate`
