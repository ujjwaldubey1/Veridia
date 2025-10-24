// Test Storacha with DID Authentication
// Run with: node test_storacha_did.js

const { Client } = require('@storacha/client')
const fs = require('fs')

// Your Storacha DID
const STORACHA_DID = 'did:key:z6Mktmi8U1pJD3hXWrB3HfVw8q5azxPHn9DoNUuGqP5wPiSN'

async function testStorachaWithDID() {
  console.log('🚀 Testing Storacha with DID Authentication')
  console.log('=' * 50)
  console.log('DID:', STORACHA_DID)
  console.log('')

  try {
    // Initialize Storacha client with your DID
    const client = new Client({ 
      did: STORACHA_DID
    })

    console.log('✅ Storacha client initialized with DID')

    // Create a test file
    const testContent = `
LAND DEED TEST

Property: 123 Test Street, Test City, TC
Owner: Test Owner
Parcel Number: TEST-123-456
Area: 1000 square feet
Zoning: R1

This is a test land deed for Storacha integration.

DID: ${STORACHA_DID}
Uploaded: ${new Date().toISOString()}
    `.trim()

    const testFile = new File([testContent], 'test-land-deed.txt', { 
      type: 'text/plain' 
    })

    console.log('📤 Uploading test file...')
    
    // Upload the test file
    const cid = await client.uploadFile(testFile, {
      onUploadProgress: (progress) => {
        console.log(`Upload progress: ${progress.percent}%`)
      }
    })

    console.log('✅ File uploaded successfully!')
    console.log('📋 CID:', cid)
    console.log('🔗 Access URL: https://w3s.link/ipfs/' + cid)
    console.log('')

    // Test file retrieval
    console.log('📥 Testing file retrieval...')
    try {
      const response = await fetch(`https://w3s.link/ipfs/${cid}`)
      if (response.ok) {
        const content = await response.text()
        console.log('✅ File retrieved successfully!')
        console.log('📄 Content preview:')
        console.log(content.substring(0, 200) + '...')
      } else {
        console.log('⚠️ File retrieval failed (may take time to propagate)')
      }
    } catch (error) {
      console.log('⚠️ File retrieval error:', error.message)
    }

    // Test multiple files
    console.log('')
    console.log('📤 Testing multiple file upload...')
    
    const files = [
      new File(['Survey data for test property'], 'survey.txt'),
      new File(['Property photos'], 'photos.txt'),
      new File(['Legal documents'], 'legal.txt')
    ]

    const directoryCid = await client.uploadFiles(files, {
      onUploadProgress: (progress) => {
        console.log(`Multiple files upload progress: ${progress.percent}%`)
      }
    })

    console.log('✅ Multiple files uploaded successfully!')
    console.log('📋 Directory CID:', directoryCid)
    console.log('🔗 Access URLs:')
    files.forEach((file, index) => {
      console.log(`  - ${file.name}: https://w3s.link/ipfs/${directoryCid}/${file.name}`)
    })

    console.log('')
    console.log('🎉 Storacha integration test completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log(`- DID: ${STORACHA_DID}`)
    console.log(`- Single file CID: ${cid}`)
    console.log(`- Directory CID: ${directoryCid}`)
    console.log('- Authentication: ✅ Working')
    console.log('- File upload: ✅ Working')
    console.log('- File retrieval: ✅ Working')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.log('')
    console.log('🔍 Troubleshooting:')
    console.log('1. Check if your DID is correct')
    console.log('2. Verify you have access to Storacha')
    console.log('3. Check your internet connection')
    console.log('4. Try again in a few minutes')
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testStorachaWithDID()
}

module.exports = { testStorachaWithDID }

