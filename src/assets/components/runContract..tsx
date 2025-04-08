'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import YourContractABI from './abi.json';

interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<string[]>;
  };
}

const CONTRACT_ADDRESS = '0xYourContractAddress';

export default function RunContract() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {


if (typeof (window as Window).ethereum !== 'undefined') {
      try {
        setIsLoading(true);
        const accounts = await (window as Window).ethereum?.request({
          method: 'eth_requestAccounts',
        });
        setAddress(accounts?.[0] || '');
        setStatus('Wallet connected successfully');
      } catch (err) {
        console.error('Error connecting to MetaMask', err);
        setStatus('Error connecting wallet');
      } finally {
        setIsLoading(false);
      }
    } else {
      setStatus('MetaMask not detected! Please install it.');
    }
  };

  const runFunction = async () => {
    if (!address) {
      return setStatus('Connect your wallet first!');
    }

    try {
      setIsLoading(true);
      setStatus('Initializing contract...');
      
      const provider = new ethers.BrowserProvider((window as Window).ethereum!);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, YourContractABI, signer);
      
      setStatus('Sending transaction...');
      const tx = await contract.callMe(); // replace with your function
      
      setStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus('Transaction confirmed!');
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Contract Interaction</h2>
      
      <div className="space-y-4">
        {address ? (
          <p className="text-green-600">Connected: {address}</p>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
        
        <button
          onClick={runFunction}
          disabled={!address || isLoading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Run Contract Function'}
        </button>
        
        {status && (
          <div className="p-2 bg-gray-200 rounded text-sm">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}