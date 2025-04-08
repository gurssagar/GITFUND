"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]); // First connected account
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, account, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
