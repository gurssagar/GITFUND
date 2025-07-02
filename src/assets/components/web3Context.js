"use client";
import { createContext, useContext } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from "ethers";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155") || {};

  // Get provider and signer from AppKit
  const getProvider = async () => {
    if (!walletProvider) return null;
    return new ethers.BrowserProvider(walletProvider);
  };

  const getSigner = async () => {
    const provider = await getProvider();
    if (!provider) return null;
    return provider.getSigner();
  };

  // Connect wallet using AppKit modal
  const connectWallet = async () => {
    // This will be managed by the AppKit button component
    // The modal will open with the <appkit-button> or useAppKit().open()
    console.log("Connect wallet through AppKit button");
  };

  return (
    <Web3Context.Provider value={{ 
      provider: walletProvider || null,
      getProvider, 
      getSigner, 
      account: address, 
      connectWallet 
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
