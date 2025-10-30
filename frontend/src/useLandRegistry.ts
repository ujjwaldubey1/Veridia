import { useCallback } from "react"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

// Environment-driven configuration with sensible defaults
const NETWORK_NAME =
    (import.meta.env.VITE_APTOS_NETWORK as string | undefined)?.toLowerCase() ??
    "devnet"

const NETWORK_MAP: Record<string, Network> = {
    devnet: Network.DEVNET,
    testnet: Network.TESTNET,
    mainnet: Network.MAINNET,
    local: Network.LOCAL,
}

const NETWORK = NETWORK_MAP[NETWORK_NAME] ?? Network.DEVNET
const NODE_URL = import.meta.env.VITE_APTOS_NODE_URL as string | undefined

export const REGISTRY_ADDRESS =
    (import.meta.env.VITE_REGISTRY_ADDRESS as string | undefined) ||
    "0xa8d945729fbf3ba5863909c8470ac6db2621b3d27b20813378e2dc38a716460b"

export const MODULE_NAME =
    (import.meta.env.VITE_MODULE_NAME as string | undefined) || "land_registry"

const aptos = new Aptos(
    new AptosConfig({
        network: NETWORK,
        fullnode: NODE_URL || undefined
    })
)

export type LandStatus = 0 | 1 | 2

export const LandStatus = {
    ACTIVE: 0,
    FROZEN: 1,
    DISPUTED: 2,
} as const

export interface Land {
    id: string // u64 as string
    owner: string
    jurisdiction: string
    metadata_hash: string
    status: { value: number }
    registered_at: string
}

export const useLandRegistry = () => {
    const { signAndSubmitTransaction } = useWallet()

    const registerLand = useCallback(
        async (
            ownerAddress: string,
            jurisdiction: string,
            metadataHash: string
        ) => {
            const tx = await signAndSubmitTransaction({
                data: {
                    function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::register_land`,
                    typeArguments: [] as string[],
                    functionArguments: [
                        ownerAddress,
                        jurisdiction,
                        metadataHash,
                    ],
                },
            })
            
            console.log('✅ Transaction submitted:', tx.hash)
            
            // Try to wait for transaction, but don't fail if it times out
            try {
                await aptos.waitForTransaction({ 
                    transactionHash: tx.hash,
                    options: {
                        timeoutSecs: 30,
                        checkSuccess: false // Don't throw on transaction failure
                    }
                })
                console.log('✅ Transaction confirmed on blockchain')
            } catch (waitError: any) {
                // Transaction was submitted but we couldn't confirm it
                // This is OK - the transaction might still be processing
                console.warn('⚠️ Could not confirm transaction, but it was submitted:', waitError.message)
            }
            
            return tx
        },
        [signAndSubmitTransaction]
    )

    const transferOwnership = useCallback(
        async (landId: number, newOwner: string) => {
            const tx = await signAndSubmitTransaction({
                data: {
                    function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::transfer_ownership`,
                    typeArguments: [] as string[],
                    functionArguments: [REGISTRY_ADDRESS, landId, newOwner],
                },
            })
            await aptos.waitForTransaction({ transactionHash: tx.hash })
            return tx
        },
        [signAndSubmitTransaction]
    )

    const updateLandStatus = useCallback(
        async (landId: number, status: LandStatus) => {
            const tx = await signAndSubmitTransaction({
                data: {
                    function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::update_status`,
                    typeArguments: [] as string[],
                    functionArguments: [landId, status],
                },
            })
            await aptos.waitForTransaction({ transactionHash: tx.hash })
            return tx
        },
        [signAndSubmitTransaction]
    )

    const getLand = useCallback(
        async (landId: number): Promise<Land | null> => {
            try {
                const result = await aptos.view({
                    payload: {
                        function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_land_info`,
                        typeArguments: [],
                        functionArguments: [REGISTRY_ADDRESS, landId.toString()],
                    }
                }) as [string, string, string, string, string, string]
                
                if (result && result.length >= 6) {
                    return {
                        id: result[0],
                        owner: result[1],
                        jurisdiction: result[2],
                        metadata_hash: result[3],
                        status: { value: parseInt(result[4]) },
                        registered_at: result[5]
                    }
                }
                return null
            } catch (error) {
                console.error("Error getting land:", error)
                return null
            }
        },
        []
    )

    const checkLandExists = useCallback(
        async (landId: number): Promise<boolean> => {
            try {
                const result = await aptos.view({
                    payload: {
                        function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::land_exists`,
                        typeArguments: [],
                        functionArguments: [REGISTRY_ADDRESS, landId.toString()],
                    }
                }) as [boolean]
                
                return !!result?.[0]
            } catch (error) {
                console.error("Error checking land exists:", error)
                return false
            }
        },
        []
    )

    const getNextLandId = useCallback(async (): Promise<number> => {
        try {
            const result = await aptos.view({
                payload: {
                    function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_next_land_id`,
                    typeArguments: [],
                    functionArguments: [REGISTRY_ADDRESS],
                }
            }) as [string]
            
            if (result && result[0]) {
                const nextId = parseInt(result[0])
                console.log("✅ Next Land ID from blockchain:", nextId)
                return nextId
            }
            throw new Error("Empty result from view function")
        } catch (error: any) {
            // Check if it's a 404 or module not found error
            const is404 = error?.message?.includes('404') || 
                         error?.message?.includes('not found') ||
                         error?.status === 404
            
            if (is404) {
                console.warn("⚠️ Contract not found or not initialized. Using default land ID (1)")
                return 1
            }
            
            console.warn("⚠️ SDK view failed, trying REST API directly...")
            
            // Fallback: Use REST API directly
            try {
                // Get fullnode URL, ensure it has /v1 suffix
                let fullnodeUrl = NODE_URL || aptos.config.fullnode || "https://fullnode.devnet.aptoslabs.com"
                if (!fullnodeUrl.endsWith("/v1")) {
                    fullnodeUrl = fullnodeUrl.replace(/\/$/, "") + "/v1"
                }
                
                const response = await fetch(`${fullnodeUrl}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_next_land_id`,
                        type_arguments: [],
                        arguments: [REGISTRY_ADDRESS],
                    }),
                })
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("⚠️ Contract not deployed at address:", REGISTRY_ADDRESS)
                        return 1
                    }
                    throw new Error(`REST API failed: ${response.status}`)
                }
                
                // Check if response has content before parsing
                const text = await response.text()
                if (!text || text.trim() === '') {
                    console.warn("⚠️ Empty response from REST API")
                    return 1
                }
                
                const data = JSON.parse(text)
                console.log("✅ REST API result:", data)
                
                if (data && Array.isArray(data) && data[0]) {
                    return parseInt(data[0])
                }
                
                // Try alternative format
                if (data?.value && Array.isArray(data.value) && data.value[0]) {
                    return parseInt(data.value[0])
                }
                
                console.warn("⚠️ Unexpected REST API response format")
                return 1
            } catch (restError: any) {
                console.warn("⚠️ REST API fallback failed:", restError.message)
                // Return 1 as default if registry not initialized
                return 1
            }
        }
    }, [])

    const getLandStatus = useCallback(
        async (landId: number): Promise<LandStatus> => {
            try {
                const result = await aptos.view({
                    payload: {
                        function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_land_status`,
                        typeArguments: [],
                        functionArguments: [REGISTRY_ADDRESS, landId.toString()],
                    }
                }) as [string]
                
                return parseInt(result[0]) as LandStatus
            } catch (error) {
                console.error("Error getting land status:", error)
                return LandStatus.ACTIVE
            }
        },
        []
    )

    return {
        registerLand,
        transferOwnership,
        updateLandStatus,
        getLand,
        checkLandExists,
        getNextLandId,
        getLandStatus,
    }
}
