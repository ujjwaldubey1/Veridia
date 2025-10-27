import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import VerifyLand from "./pages/VerifyLand.tsx"
import MyPortfolio from "./pages/MyPortfolio.tsx"
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
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/verify" element={<VerifyLand />} />
                    <Route path="/portfolio" element={<MyPortfolio />} />
                </Routes>
            </BrowserRouter>
        </AptosWalletAdapterProvider>
    </StrictMode>
)
