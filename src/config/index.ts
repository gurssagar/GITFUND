import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Get projectId from environment variables with fallback
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ;

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
};

export const networks = [pharosDevnet, pharosTestnet];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: projectId || 'demo-project-id', // Ensure we always have a fallback
  networks
});

export const config = wagmiAdapter.wagmiConfig;