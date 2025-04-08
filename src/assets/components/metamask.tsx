'use client';

import { useState } from 'react';
interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<string[]>;
  };
}
export default function MetaMaskButton() {
  const [address, setAddress] = useState('');

  const connectWallet = async () => {
    if (typeof (window as Window).ethereum !== 'undefined') {
      try {
        const accounts = await (window as Window).ethereum?.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (err) {
        console.error('Error connecting to MetaMask', err);
      }
    } else {
      alert('MetaMask not detected! Please install it.');
    }
  };

  return (
    <div className="">
      {address ? (
        <p className="text-green-600">Connected: {address}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-1 text-[14px]  bg-gray-100 text-black rounded-lg"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
