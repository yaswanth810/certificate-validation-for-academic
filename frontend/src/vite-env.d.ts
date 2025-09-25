/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CERTIFICATE_NFT_ADDRESS: string
  readonly VITE_SCHOLARSHIP_ESCROW_ADDRESS: string
  readonly VITE_VIGNAN_REGISTRY_ADDRESS: string
  readonly VITE_NETWORK_ID: string
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
