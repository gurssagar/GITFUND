'use client';

import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  if (isConnected) {
    return (
      <button 
        onClick={() => open()}
        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <>
      {/* You can use either the web component or a custom button */}
      
      {/* Web component option */}
      <appkit-button />
      
      {/* Or custom button option */}
      {/*
      <button
        onClick={() => open()}
        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Connect Wallet
      </button>
      */}
    </>
  );
}