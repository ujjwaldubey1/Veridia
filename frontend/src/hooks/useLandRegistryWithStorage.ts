import { useCallback, useState } from "react"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import useWeb3Storage, { LandDocument } from "./useWeb3Storage"

// Environment-driven configuration
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
    new AptosConfig(
        NODE_URL
            ? { network: NETWORK, fullnode: NODE_URL }
            : { network: NETWORK }
    )
)

export type LandStatus = 0 | 1 | 2

export const LandStatus = {
    ACTIVE: 0,
    FROZEN: 1,
    DISPUTED: 2,
} as const

export interface Land {
    id: string
    owner: string
    jurisdiction: string
    metadata_hash: string
    status: { value: number }
    registered_at: string
}

export interface LandMetadata {
    title: string
    description: string
    property_details: {
        address: string
        coordinates: {
            latitude: number
            longitude: number
        }
        area: string
        property_type: string
    }
    documents: {
        deed?: string
        survey?: string
        photos?: string
    }
    legal_info: {
        parcel_number: string
        zoning: string
        restrictions: string[]
    }
    registered_date: string
    storage_provider: string
}

export const useLandRegistryWithStorage = () => {
    const { signAndSubmitTransaction } = useWallet()
    const web3Storage = useWeb3Storage()
    const [loading, setLoading] = useState(false)

    // Register land with documents
    const registerLandWithDocuments = useCallback(
        async (
            ownerAddress: string,
            jurisdiction: string,
            landMetadata: Omit<LandMetadata, 'registered_date' | 'storage_provider'>,
            documents: {
                deed?: File
                survey?: File
                photos?: File
            }
        ) => {
            setLoading(true)
            try {
                // Prepare documents for upload
                const documentsToUpload: LandDocument[] = []
                
                if (documents.deed) {
                    documentsToUpload.push({
                        file: documents.deed,
                        type: 'deed',
                        name: 'deed.pdf'
                    })
                }
                
                if (documents.survey) {
                    documentsToUpload.push({
                        file: documents.survey,
                        type: 'survey',
                        name: 'survey.pdf'
                    })
                }
                
                if (documents.photos) {
                    documentsToUpload.push({
                        file: documents.photos,
                        type: 'photos',
                        name: 'photos.zip'
                    })
                }

                // Upload documents to Web3.Storage
                const uploadResult = await web3Storage.uploadLandDocuments(documentsToUpload)

                // Create complete metadata with document hashes
                const completeMetadata: LandMetadata = {
                    ...landMetadata,
                    documents: uploadResult.documents,
                    registered_date: new Date().toISOString(),
                    storage_provider: "Web3.Storage (Storacha)"
                }

                // Upload metadata to Web3.Storage
                const metadataFile = new File(
                    [JSON.stringify(completeMetadata, null, 2)],
                    'land-metadata.json',
                    { type: 'application/json' }
                )

                const metadataResult = await web3Storage.uploadFile(metadataFile)

                // Register land with metadata hash
                const tx = await signAndSubmitTransaction({
                    data: {
                        function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::register_land`,
                        typeArguments: [] as string[],
                        functionArguments: [
                            ownerAddress,
                            jurisdiction,
                            metadataResult.cid, // Use Web3.Storage CID
                        ],
                    },
                })

                await aptos.waitForTransaction({ transactionHash: tx.hash })

                return {
                    transaction: tx,
                    metadata: completeMetadata,
                    metadataCid: metadataResult.cid,
                    metadataUrl: metadataResult.url
                }

            } catch (error) {
                console.error('Land registration with documents failed:', error)
                throw error
            } finally {
                setLoading(false)
            }
        },
        [signAndSubmitTransaction, web3Storage]
    )

    // Register land with simple metadata (backward compatibility)
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
            await aptos.waitForTransaction({ transactionHash: tx.hash })
            return tx
        },
        [signAndSubmitTransaction]
    )

    // Transfer ownership
    const transferOwnership = useCallback(
        async (landId: number, newOwner: string) => {
            const tx = await signAndSubmitTransaction({
                data: {
                    function: `${REGISTRY_ADDRESS}::${MODULE_NAME}::transfer_ownership`,
                    typeArguments: [] as string[],
                    functionArguments: [landId, newOwner],
                },
            })
            await aptos.waitForTransaction({ transactionHash: tx.hash })
            return tx
        },
        [signAndSubmitTransaction]
    )

    // Update land status
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

    // Get land information
    const getLand = useCallback(
        async (landId: number): Promise<Land | null> => {
            const payload = {
                function:
                    `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_land_info` as `${string}::${string}::${string}`,
                type_arguments: [] as string[],
                arguments: [REGISTRY_ADDRESS, landId.toString()],
            }

            const result = (await aptos.view({ payload })) as [Land]
            return result?.[0] ?? null
        },
        []
    )

    // Get land metadata from Web3.Storage
    const getLandMetadata = useCallback(
        async (landId: number): Promise<LandMetadata | null> => {
            try {
                // First get land info from blockchain
                const landInfo = await getLand(landId)
                if (!landInfo) return null

                // Get metadata from Web3.Storage
                const response = await web3Storage.getFile(landInfo.metadata_hash)
                const metadata: LandMetadata = await response.json()
                return metadata
            } catch (error) {
                console.error('Failed to get land metadata:', error)
                return null
            }
        },
        [getLand, web3Storage]
    )

    // Check if land exists
    const checkLandExists = useCallback(
        async (landId: number): Promise<boolean> => {
            const payload = {
                function:
                    `${REGISTRY_ADDRESS}::${MODULE_NAME}::land_exists` as `${string}::${string}::${string}`,
                type_arguments: [] as string[],
                arguments: [REGISTRY_ADDRESS, landId.toString()],
            }

            const result = (await aptos.view({ payload })) as [boolean]
            return !!result?.[0]
        },
        []
    )

    // Get next land ID
    const getNextLandId = useCallback(async (): Promise<number> => {
        const payload = {
            function:
                `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_next_land_id` as `${string}::${string}::${string}`,
            type_arguments: [] as string[],
            arguments: [REGISTRY_ADDRESS],
        }

        const result = (await aptos.view({ payload })) as [string]
        return parseInt(result[0])
    }, [])

    // Get land status
    const getLandStatus = useCallback(
        async (landId: number): Promise<LandStatus> => {
            const payload = {
                function:
                    `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_land_status` as `${string}::${string}::${string}`,
                type_arguments: [] as string[],
                arguments: [REGISTRY_ADDRESS, landId.toString()],
            }

            const result = (await aptos.view({ payload })) as [string]
            return parseInt(result[0]) as LandStatus
        },
        []
    )

    return {
        // Land registration
        registerLand,
        registerLandWithDocuments,
        
        // Land management
        transferOwnership,
        updateLandStatus,
        
        // Data retrieval
        getLand,
        getLandMetadata,
        checkLandExists,
        getNextLandId,
        getLandStatus,
        
        // Web3.Storage utilities
        uploadFile: web3Storage.uploadFile,
        uploadFiles: web3Storage.uploadFiles,
        getFileUrl: web3Storage.getFileUrl,
        verifyFile: web3Storage.verifyFile,
        
        // Loading states
        loading: loading || web3Storage.uploading,
        uploadProgress: web3Storage.uploadProgress,
    }
}

export default useLandRegistryWithStorage
