import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define the custom Pharos Devnet chain
const pharosDevnet = {
  id: 50002,
  name: 'Pharos Devnet',
  nativeCurrency: { name: 'Pharos', symbol: 'PHAROS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
    public: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'PharosScan Devnet', url: 'https://devnet.pharosscan.xyz' },
  },
}

const BnbTestnet = {
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'TBNB', symbol: 'TBNB', decimals: 18 }, // Adjust if necessary
  rpcUrls: {
    default: { http: ['https://bsc-testnet.drpc.org'] },
    public: { http: ['https://bsc-testnet.drpc.org'] },
  },
  blockExplorers: {
    default: { name: 'Binance Smart Chain Testnet', url: 'https://testnet.bscscan.com' },
  },
  // You can add testnet: true if appropriate, though not explicitly stated
  // testnet: true, 
};

const pharosTestnet = {
  id: 688688,
  name: 'Pharos Testnet',
  nativeCurrency: { name: 'Pharos', symbol: 'PHAROS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.dplabs-internal.com/'] },
    public: { http: ['https://testnet.dplabs-internal.com/'] },
  },
  blockExplorers: {
    default: { name: 'PharosScan Testnet', url: 'https://testnet.pharosscan.xyz' },
  }
}

export const networks = [sepolia, pharosDevnet, pharosTestnet,BnbTestnet]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig