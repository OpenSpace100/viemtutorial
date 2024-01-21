"use client";
import { useState } from "react";

import { ConnectWalletClient, ConnectPublicClient } from "./client";
import { formatEther, getContract } from "viem";
import { wagmi2612Abi } from "./abi_erc2612";

export default function WalletButton() {

	//State variable for address & balance
  const [address, setAddress] = useState<string | null>(null);
	const [balance, setBalance] = useState<BigInt>(BigInt(0));
  const [tokenBalance, setTokenBalance] = useState<BigInt>(BigInt(0));

	// Requests connection and retrieves the address of wallet.
	// Retrievies the balance of the address
	// Updates the value for address & balance variable
  async function handleClick() {
    try {

			// Instantiate a Wallet & Public Client
      const walletClient = ConnectWalletClient();
			const publicClient = ConnectPublicClient();

			// Perform Wallet Action to retrieve wallet address
      const [address] = await walletClient.getAddresses();

			// Perform Public Action to retrieve address balance
			const balance = await publicClient.getBalance({ address });


      const token2612 = getContract({
        address: "0x1012E55A1BB63F6Da5685A2Af479f0FdD9591157",
        abi: wagmi2612Abi,
        publicClient,
        walletClient,
      });


      const tokenBalance = await token2612.read.balanceOf([address]);

      const humanTokenBalance = formatEther(tokenBalance);

			// Update values for address & balance state variable
      setAddress(address);
      setBalance(balance);
      setTokenBalance( tokenBalance );
    } catch (error) {
			// Error handling
      alert(`Transaction failed: ${error}`);
    }
  }

  return (
    <>
      <Status address={address} balance={balance} tokenBalance={tokenBalance} />
      <button className="px-8 py-2 rounded-md bg-[#1e2124] flex flex-row items-center justify-center border border-[#1e2124] hover:border hover:border-indigo-600 shadow-md shadow-indigo-500/10"
        onClick={handleClick}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask Fox" style={{ width: "25px", height: "25px" }} />
        <h1 className="mx-auto">Connect Wallet</h1>
      </button>
    </>
  );
}

// Displays the wallet address once it’s successfuly connected
// You do not have to read it, it's just frontend stuff
function Status({
  address,
  balance,
  tokenBalance,
}: {
  address: string | null;
  balance: BigInt;
  tokenBalance: BigInt;
}) {
  if (!address) {
    return (
      <div className="flex items-center">
        <div className="border bg-red-600 border-red-600 rounded-full w-1.5 h-1.5 mr-2"></div>
        <div>Disconnected</div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      <div className="border bg-green-500 border-green-500 rounded-full w-1.5 h-1.5 mr-2"></div>
      <div className="text-xs md:text-xs">
        {address} <br /> Eth Balance: {balance.toString()}
        <br /> Token Balance: {tokenBalance.toString()}
      </div>
    </div>
  );
}