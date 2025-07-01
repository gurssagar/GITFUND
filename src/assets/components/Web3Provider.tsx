"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains"; // Keep mainnet or remove if only Pharos is needed
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Define the custom Pharos Devnet chain
const pharosDevnet = {
  id: 50002,
  name: 'Pharos Devnet',
  nativeCurrency: { name: 'Pharos', symbol: 'PHAROS', decimals: 18 }, // Adjust if necessary
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
    public: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'PharosScan Devnet', url: 'https://devnet.pharosscan.xyz' },
  },
  // You can add testnet: true if appropriate, though not explicitly stated
  // testnet: true, 
};

const PharosTestnet = {
  id: 97,
  name: 'Pharos Smart Chain Testnet',
  nativeCurrency: { name: 'TPharos', symbol: 'TPharos', decimals: 18 }, // Adjust if necessary
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

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains - add Pharos Devnet
    chains: [pharosDevnet], // Add pharosDevnet here. You can remove mainnet if not needed.
    transports: {
      // RPC URL for each chain
      
      [pharosDevnet.id]: http('https://devnet.dplabs-internal.com'), // Add transport for Pharos
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Required App Info
    appName: "GitFund",

    // Optional App Info
    appDescription: "An Open Source Issue Solving Platform",
    appUrl: "https://gitfund-osnf.vercel.app", // your app's url
    appIcon:"https://gitfund-osnf.vercel.app/gitfund-white-icon.webp", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};