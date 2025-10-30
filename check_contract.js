// Quick script to check if contract is deployed
const CONTRACT_ADDRESS = "0xa8d945729fbf3ba5863909c8470ac6db2621b3d27b20813378e2dc38a716460b"

async function checkContract() {
    console.log('🔍 Checking contract deployment...')
    console.log('📍 Address:', CONTRACT_ADDRESS)
    
    try {
        const response = await fetch(
            `https://fullnode.devnet.aptoslabs.com/v1/accounts/${CONTRACT_ADDRESS}/modules`,
            { method: 'GET' }
        )
        
        console.log('📡 Response status:', response.status)
        
        if (response.status === 404) {
            console.log('\n❌ CONTRACT NOT FOUND!')
            console.log('\n📝 To deploy the contract:')
            console.log('   1. Make sure Move.toml has the correct address')
            console.log('   2. Run: aptos move publish --named-addresses veridia=default')
            console.log('   3. Or run: aptos move publish --named-addresses veridia=' + CONTRACT_ADDRESS.slice(0, 10) + '...')
            return
        }
        
        if (!response.ok) {
            console.log('❌ Error:', response.status, response.statusText)
            return
        }
        
        const modules = await response.json()
        console.log('\n✅ Contract found!')
        console.log('📦 Modules:', modules.length)
        
        const landRegistry = modules.find(m => m.abi?.name === 'land_registry')
        if (landRegistry) {
            console.log('✅ land_registry module found!')
            console.log('\n📋 Functions available:')
            landRegistry.abi.exposed_functions
                .filter(f => f.is_entry)
                .forEach(f => console.log('   -', f.name))
        } else {
            console.log('⚠️ land_registry module not found in deployed modules')
            console.log('Available modules:', modules.map(m => m.abi?.name).join(', '))
        }
        
        console.log('\n🔗 View on Explorer:')
        console.log(`   https://explorer.aptoslabs.com/account/${CONTRACT_ADDRESS}?network=devnet`)
        
    } catch (error) {
        console.error('❌ Error checking contract:', error.message)
    }
}

checkContract()

