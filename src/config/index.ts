import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'

// Get projectId from environment variables with fallback
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'demo-project-id';

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

const PharosTestnet = {
  id: 97,
  name: 'Pharos Smart Chain Testnet',
  nativeCurrency: { name: 'tPharos', symbol: 'tPharos', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-testnet.Pharoschain.org/'] },
    public: { http: ['https://bsc-testnet.Pharoschain.org/'] },
  },
  blockExplorers: {
    default: { name: 'Binance Smart Chain Testnet', url: 'https://testnet.bscscan.com' },
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

export const networks = [sepolia, pharosDevnet, pharosTestnet, PharosTestnet];

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