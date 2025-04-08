"use client";
import { useState } from "react";
import { useWeb3 } from "./web3Context";
import { getContract } from "./contract";
import { ethers } from "ethers";

const ContractInteraction = () => {
  const { provider, signer } = useWeb3();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [contractBalance, setContractBalance] = useState("0");

  // Deposit ETH into the contract
  const handleDeposit = async () => {
    if (!signer) return alert("Connect your wallet first!");
    try {
      const contract = getContract(signer);
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      alert(`Deposited ${depositAmount} ETH`);
      fetchBalance();
    } catch (error) {
      console.error("Deposit Error:", error);
      alert("Deposit failed!");
    }
  };

  // Withdraw ETH from the contract
  const handleWithdraw = async () => {
    if (!signer) return alert("Connect your wallet first!");
    try {
      const contract = getContract(signer);
      const tx = await contract.withdraw(recipient, ethers.parseEther(withdrawAmount));
      await tx.wait();
      alert(`Withdrawn ${withdrawAmount} ETH to ${recipient}`);
      fetchBalance();
    } catch (error) {
      console.error("Withdraw Error:", error);
      alert("Withdraw failed!");
    }
  };

  // Fetch contract balance
  const fetchBalance = async () => {
    if (!provider) return;
    try {
      const contract = getContract(provider);
      const balance = await contract.getBalance();
      setContractBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Fetch Balance Error:", error);
    }
  };

  return (
    <div className="p-4 border rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">EtherVault Contract</h2>

      {/* Deposit ETH */}
      <div className="mb-4">
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount in ETH"
          className="border p-2 rounded mr-2"
        />
        <button onClick={handleDeposit} className="px-4 py-2 bg-blue-600 text-white rounded">
          Deposit
        </button>
      </div>

      {/* Withdraw ETH */}
      <div className="mb-4">
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient Address"
          className="border p-2 rounded mr-2 w-80"
        />
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount in ETH"
          className="border p-2 rounded mr-2"
        />
        <button onClick={handleWithdraw} className="px-4 py-2 bg-red-600 text-white rounded">
          Withdraw
        </button>
      </div>

      {/* Contract Balance */}
      <div className="mt-4">
        <button onClick={fetchBalance} className="px-4 py-2 bg-green-600 text-white rounded">
          Check Contract Balance
        </button>
        <p className="mt-2">Contract Balance: {contractBalance} ETH</p>
      </div>
    </div>
  );
};

export default ContractInteraction;
