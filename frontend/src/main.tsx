import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { Network } from "@aptos-labs/ts-sdk"
import "antd/dist/reset.css"

// Use Vite env to control network without code changes
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

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AptosWalletAdapterProvider
            autoConnect
            dappConfig={{ network: NETWORK }}
            onError={(e) => console.error(e)}
        >
            <App />
        </AptosWalletAdapterProvider>
    </StrictMode>
)
