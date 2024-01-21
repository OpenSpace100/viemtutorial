"use client";
import { useState, useEffect } from "react";
import { formatEther, getContract, parseUnits   } from "viem";

import { wagmi2612Abi } from "./abi_erc2612";
import { tokenBankAbi } from "./abi_tokenbank";

import { ConnectWalletClient, ConnectPublicClient } from "./client";


const erc2612Address = "0x1012E55A1BB63F6Da5685A2Af479f0FdD9591157"
const tokenBankAddress = "0x7fBD1C8BEb374328d8FAB04a5F39579DB334566e"

export default function Deposit() {

  // Declare Client
  const walletClient = ConnectWalletClient();
  const publicClient = ConnectPublicClient();

	const [address, setAddress] = useState<string | null>(null);
  const [allowanced, setAllowanced] = useState<BigInt>(BigInt(0));
  const [deposited, setDeposited] = useState<BigInt>(BigInt(0));
  
  const [token, setToken] = useState<any>(null);
  const [tokenBank, setTokenBank] = useState<any>(null);
  
  useEffect( () => {
    getTokenContractInfo()
    refreshAllowance();
    refreshDeposited();
}, [])


  const getTokenContractInfo = async () => {

    const [address] = await walletClient.getAddresses();

    console.log(" address :" +  address);
		
    const token = getContract({
      address: erc2612Address,
      abi: wagmi2612Abi,
      publicClient,
      walletClient,
    });

    const tokenBank = getContract({
      address: tokenBankAddress,
      abi: tokenBankAbi,
      publicClient,
      walletClient,
    });



    setToken(token);
    setAddress(address);
    setTokenBank(tokenBank);
  }   

  const refreshAllowance = async () => {
    const allowanced = await token?.read.allowance([address, tokenBankAddress]);
    setAllowanced(allowanced)
  }

  const refreshDeposited = async () => {
    const deposited = await tokenBank?.read.deposited([address]);
    setDeposited(deposited)
  }

	// Function to Interact With Smart Contract
  async function handleApprove() {
    try {
      const amount = parseUnits('1', 18) 
      const hash = await token.write.approve([tokenBankAddress, amount], {account: address});
      console.log(`approve hash: ${hash} `);

      await publicClient.getTransactionReceipt({
        hash: hash
      })

      refreshAllowance();

    } catch (error) {
      alert(`Transaction failed: ${error}`);
    }
  }


  async function handleDeposit() {
    try {
      const amount = parseUnits('1', 18) 
      const hash = await tokenBank.write.deposit([address, amount], {account: address})
      console.log(`deposit hash: ${hash} `);

      await publicClient.getTransactionReceipt({
        hash: hash
      })

      refreshDeposited();

    } catch (error) {
      alert(`Transaction failed: ${error}`);
    }
  }


  return (
    <>
     <DepositInfo allowanced={ allowanced }  deposited={deposited} />
      <button
        className="py-2.5 px-2 rounded-md bg-[#1e2124] flex flex-row items-center justify-center border border-[#1e2124] hover:border hover:border-indigo-600 shadow-md shadow-indigo-500/10"
      >
        <h1 className="text-center" onClick={handleApprove}>Approve</h1>
      </button>

      <button
        className="py-2.5 px-2 rounded-md bg-[#1e2124] flex flex-row items-center justify-center border border-[#1e2124] hover:border hover:border-indigo-600 shadow-md shadow-indigo-500/10"
      >
        <h1 className="text-center" onClick={handleDeposit}>Deposit</h1>
      </button>

    </>
  );
}


function DepositInfo({
  allowanced,
  deposited
}: {
  allowanced: BigInt;
  deposited: BigInt;
}) {
  return (
    <div className="flex items-center w-full">
      <div className="border bg-green-500 border-green-500 rounded-full w-1.5 h-1.5 mr-2"></div>
      <div className="text-xs md:text-xs">
       My Allowanced: {allowanced?.toString()}
        <br />
        My Deposit: {deposited.toString()}
      </div>
    </div>
  );
}