// lib/config.ts
 
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { blob } from "stream/consumers";
import { cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";
 
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
 
if (!projectId) throw new Error("Project ID is not defined");

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
  // testnet: true, // You can uncomment this if it's a testnet
};

const pharosTestnet={
    id:688688,
    name: 'Pharos Testnet',
    nativeCurrency: { name: 'Pharos', symbol: 'PHAROS', decimals: 18 },
    rpcUrls: {
      default:{http:['https://testnet.dplabs-internal.com/']},
    },
    blockExplorers: {
        default: { name: 'PharosScan Devnet', url: 'https://testnet.pharosscan.xyz' },

    }
}
 
const metadata = {
  name: "GitFund",
  description: "An Open Source Issue Solving Platform",
  url: "https://gitfund-osnf.vercel.app", // your app's url
  icons: ["https://gitfund-osnf.vercel.app/gitfund-white-icon.webp"], // your app's icon
};
 
export const config = defaultWagmiConfig({
  chains: [sepolia, pharosDevnet,pharosTestnet], // Added pharosDevnet
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});