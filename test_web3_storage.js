// Test Web3.Storage Integration
// Run with: node test_web3_storage.js

const { Client } = require('@storacha/client')
const fs = require('fs')
const path = require('path')

// Initialize Web3.Storage client
const client = new Client({ 
  token: process.env.WEB3_STORAGE_TOKEN || 'your_token_here'
})

async function testWeb3Storage() {
  console.log('🚀 Testing Web3.Storage Integration')
  console.log('=' * 50)

  try {
    // 1. Create test files
    console.log('📝 Creating test files...')
    
    const testDir = './test_files'
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir)
    }

    // Create sample land deed
    const deedContent = `
LAND DEED

Property: 123 Main Street, San Francisco, CA
Owner: John Doe
Parcel Number: 123-456-789
Area: 5000 square feet
Zoning: R1

This deed certifies that the above property is legally owned by John Doe
as of January 15, 2024.

Signed: John Doe
Date: ${new Date().toISOString()}
    `.trim()

    fs.writeFileSync(path.join(testDir, 'deed.txt'), deedContent)

    // Create sample survey
    const surveyContent = `
SURVEY REPORT

Property: 123 Main Street, San Francisco, CA
Surveyor: ABC Surveying Co.
Date: January 10, 2024

Boundaries:
- North: 100 feet
- South: 100 feet  
- East: 50 feet
- West: 50 feet

Total Area: 5000 square feet
    `.trim()

    fs.writeFileSync(path.join(testDir, 'survey.txt'), surveyContent)

    // Create sample metadata
    const metadata = {
      title: "Land Deed for 123 Main Street",
      description: "Residential property in San Francisco, CA",
      property_details: {
        address: "123 Main Street, San Francisco, CA",
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        area: "5000 square feet",
        property_type: "Residential"
      },
      legal_info: {
        parcel_number: "123-456-789",
        zoning: "R1",
        restrictions: ["Single family residential only"]
      },
      registered_date: new Date().toISOString(),
      storage_provider: "Web3.Storage (Storacha)"
    }

    fs.writeFileSync(
      path.join(testDir, 'metadata.json'), 
      JSON.stringify(metadata, null, 2)
    )

    console.log('✅ Test files created')

    // 2. Upload individual files
    console.log('\n📤 Uploading individual files...')
    
    const deedFile = fs.readFileSync(path.join(testDir, 'deed.txt'))
    const deedCid = await client.uploadFile(new File([deedFile], 'deed.txt'))
    console.log(`✅ Deed uploaded: ${deedCid}`)
    console.log(`🔗 Access URL: https://w3s.link/ipfs/${deedCid}`)

    const surveyFile = fs.readFileSync(path.join(testDir, 'survey.txt'))
    const surveyCid = await client.uploadFile(new File([surveyFile], 'survey.txt'))
    console.log(`✅ Survey uploaded: ${surveyCid}`)
    console.log(`🔗 Access URL: https://w3s.link/ipfs/${surveyCid}`)

    // 3. Upload metadata
    console.log('\n📤 Uploading metadata...')
    
    const metadataFile = fs.readFileSync(path.join(testDir, 'metadata.json'))
    const metadataCid = await client.uploadFile(
      new File([metadataFile], 'metadata.json', { type: 'application/json' })
    )
    console.log(`✅ Metadata uploaded: ${metadataCid}`)
    console.log(`🔗 Access URL: https://w3s.link/ipfs/${metadataCid}`)

    // 4. Create complete land registry entry
    console.log('\n🏗️ Creating complete land registry entry...')
    
    const landRegistryEntry = {
      land_id: 1,
      owner: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      jurisdiction: "San Francisco, CA",
      metadata_hash: metadataCid,
      status: 0, // Active
      registered_at: Date.now(),
      documents: {
        deed: deedCid,
        survey: surveyCid
      }
    }

    console.log('📋 Land Registry Entry:')
    console.log(JSON.stringify(landRegistryEntry, null, 2))

    // 5. Test file retrieval
    console.log('\n📥 Testing file retrieval...')
    
    try {
      const response = await fetch(`https://w3s.link/ipfs/${metadataCid}`)
      const retrievedMetadata = await response.json()
      console.log('✅ Metadata retrieved successfully:')
      console.log(JSON.stringify(retrievedMetadata, null, 2))
    } catch (error) {
      console.log('⚠️ Metadata retrieval failed (may take time to propagate):', error.message)
    }

    // 6. Verify files
    console.log('\n🔍 Verifying files...')
    
    const verifyFile = async (cid, name) => {
      try {
        const response = await fetch(`https://w3s.link/ipfs/${cid}`, { method: 'HEAD' })
        console.log(`${name}: ${response.ok ? '✅ Available' : '❌ Not available'}`)
      } catch (error) {
        console.log(`${name}: ⚠️ Error checking (${error.message})`)
      }
    }

    await verifyFile(deedCid, 'Deed')
    await verifyFile(surveyCid, 'Survey')
    await verifyFile(metadataCid, 'Metadata')

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test files...')
    fs.rmSync(testDir, { recursive: true, force: true })
    console.log('✅ Test files cleaned up')

    console.log('\n🎉 Web3.Storage integration test completed!')
    console.log('\n📋 Summary:')
    console.log(`- Deed CID: ${deedCid}`)
    console.log(`- Survey CID: ${surveyCid}`)
    console.log(`- Metadata CID: ${metadataCid}`)
    console.log(`- Land Registry Entry: Ready for blockchain storage`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testWeb3Storage()
}

module.exports = { testWeb3Storage }
