// Test IPFS Integration with Veridia Land Registry
// This script demonstrates how to work with IPFS in your project

const { create } = require('ipfs-http-client')

// Initialize IPFS client
const ipfs = create('https://ipfs.infura.io:5001')

// Example land document metadata
const landMetadata = {
    title: "Land Deed for 123 Main Street",
    description: "Residential property in California, USA",
    property_details: {
        address: "123 Main Street, San Francisco, CA",
        coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
        },
        area: "5000 square feet",
        property_type: "Residential"
    },
    documents: {
        deed: "QmDeedHash123...", // These would be actual IPFS hashes
        survey: "QmSurveyHash456...",
        photos: "QmPhotosHash789..."
    },
    legal_info: {
        parcel_number: "123-456-789",
        zoning: "R1",
        restrictions: ["Single family residential only"]
    },
    registered_date: new Date().toISOString(),
    registry_info: {
        blockchain: "Aptos",
        contract_address: "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17",
        land_id: 1
    }
}

async function testIPFSIntegration() {
    try {
        console.log("🚀 Testing IPFS Integration with Veridia Land Registry")
        console.log("=" * 60)
        
        // 1. Upload metadata to IPFS
        console.log("📤 Uploading land metadata to IPFS...")
        const metadataString = JSON.stringify(landMetadata, null, 2)
        const result = await ipfs.add(metadataString)
        const ipfsHash = result.path
        
        console.log(`✅ Metadata uploaded successfully!`)
        console.log(`📋 IPFS Hash: ${ipfsHash}`)
        console.log(`🔗 Access URL: https://ipfs.io/ipfs/${ipfsHash}`)
        
        // 2. Simulate storing in blockchain
        console.log("\n⛓️ Simulating blockchain storage...")
        const blockchainData = {
            land_id: 1,
            owner: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            jurisdiction: "California, USA",
            metadata_hash: ipfsHash, // This goes into your smart contract
            status: 0, // Active
            registered_at: Date.now()
        }
        
        console.log("✅ Blockchain data prepared:")
        console.log(JSON.stringify(blockchainData, null, 2))
        
        // 3. Retrieve and verify data
        console.log("\n📥 Retrieving data from IPFS...")
        const retrievedData = await ipfs.cat(ipfsHash)
        const retrievedMetadata = JSON.parse(retrievedData.toString())
        
        console.log("✅ Data retrieved successfully!")
        console.log("📋 Retrieved metadata:")
        console.log(JSON.stringify(retrievedMetadata, null, 2))
        
        // 4. Verify data integrity
        console.log("\n🔍 Verifying data integrity...")
        const isDataIntact = JSON.stringify(retrievedMetadata) === metadataString
        console.log(`✅ Data integrity: ${isDataIntact ? 'PASSED' : 'FAILED'}`)
        
        // 5. Show how to use in your frontend
        console.log("\n🌐 Frontend Integration Example:")
        console.log(`
// In your React component
const landInfo = await getLand(1)
const ipfsHash = landInfo.metadata_hash

// Access the full metadata
const response = await fetch(\`https://ipfs.io/ipfs/\${ipfsHash}\`)
const metadata = await response.json()

// Now you can display all the land details
console.log('Property Title:', metadata.title)
console.log('Address:', metadata.property_details.address)
console.log('Area:', metadata.property_details.area)
        `)
        
        console.log("\n🎉 IPFS integration test completed successfully!")
        
    } catch (error) {
        console.error("❌ Error during IPFS integration test:", error)
    }
}

// Run the test
if (require.main === module) {
    testIPFSIntegration()
}

module.exports = { testIPFSIntegration, landMetadata }
