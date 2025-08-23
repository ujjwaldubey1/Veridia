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
    "0xb0270d34e3e2fb1731dbd10cd38472e0322f7b0af7fe97b43475ddf01d1b7b17"

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
            await aptos.waitForTransaction({ transactionHash: tx.hash })
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
                    functionArguments: [landId, newOwner],
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
            const payload = {
                function:
                    `${REGISTRY_ADDRESS}::${MODULE_NAME}::get_land` as `${string}::${string}::${string}`,
                type_arguments: [] as string[],
                arguments: [REGISTRY_ADDRESS, landId.toString()],
            }

            const result = (await aptos.view({ payload })) as [Land]
            return result?.[0] ?? null
        },
        []
    )

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
        registerLand,
        transferOwnership,
        updateLandStatus,
        getLand,
        checkLandExists,
        getNextLandId,
        getLandStatus,
    }
}
