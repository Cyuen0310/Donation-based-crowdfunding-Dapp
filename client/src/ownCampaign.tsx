import React from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { defineChain } from "thirdweb";
import { client } from "./client";
import { ethers, formatEther } from "ethers";

export default function OwnCampaign() {
  const account = useActiveAccount();

  const contractConfig = {
    client: client,
    chain: defineChain(11155111), // Sepolia
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d" as `0x${string}`,
  };

  const { data: campaignIds, isLoading: isLoadingIds, error: errorIds } = useReadContract({
    contract: contractConfig, // Nest contractConfig inside contract property
    method: "function getCreatedCampaigns(address _owner) view returns (uint256[])",
    params: [account?.address || ""],
  });

  // Helper function to fetch campaign details by ID
  const CampaignDetails = ({ campaignId }: { campaignId: bigint }) => {
    const { data, isLoading, error } = useReadContract({
      contract: contractConfig, // Nest contractConfig inside contract property
      method:
        "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
      params: [campaignId],
    });

    if (isLoading) {
      return <p>Loading campaign details...</p>;
    }

    if (error) {
      return (
        <p className="text-red-500">
          Error fetching campaign details: {error.message}
        </p>
      );
    }

    if (!data) {
      return null; // Or display a message if no data is found
    }

    const [owner, title, description, target, deadline, fundedAmount, numberOfBackers, isActive, isCollected] = data;

    // Convert BigInt values to numbers for progress calculation
    const targetEther = target ? Number(formatEther(target.toString())) : 0;
    const fundedAmountEther = fundedAmount ? Number(formatEther(fundedAmount.toString())) : 0;

    // Calculate percentage, handling cases where target is zero
    let progress: number;
    if (targetEther > 0) {
      progress = (fundedAmountEther / targetEther) * 100; // Remove Math.min(100, ...)
    } else if (fundedAmountEther > 0) {
      // If target is zero but fund is raised, consider it infinite percent
      progress = Infinity;
    } else {
      progress = 0; // If both are zero
    }

    let displayProgress = isFinite(progress) ? progress.toFixed(2) : "∞";

    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {isActive ? "Ongoing" : "Ended"}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{description}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Raised: {fundedAmount ? formatEther(fundedAmount.toString()) : "0"} ETH</span>
              <span>Target: {target ? formatEther(target.toString()) : "0"} ETH</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="text-sm mt-1 text-gray-500">
              {displayProgress}% Funded
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
            <div>
              <span className="block font-medium">Creator</span>
              <span className="truncate">{`${owner.slice(0, 6)}...${owner.slice(-4)}`}</span>
            </div>
            <div>
              <span className="block font-medium">Backers</span>
              <span>{numberOfBackers.toString()} people</span>
            </div>
            <div className="col-span-2">
              <span className="block font-medium">Deadline</span>
              <span>{new Date(Number(deadline) * 1000).toLocaleString()}</span>
            </div>
            <div className="col-span-2">
              <span className="block font-medium">Your Donation</span>
              <span>0 ETH</span> {/*  Placeholder */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Campaigns</h1>
      {account ? (
        <div>
          <p className="text-lg text-center">Your Wallet Address: {account.address}</p>
          {isLoadingIds ? (
            <p className="text-center">Loading campaign IDs...</p>
          ) : errorIds ? (
            <p className="text-center text-red-500">Error fetching campaign IDs: {errorIds.message}</p>
          ) : campaignIds && campaignIds.length > 0 ? (
            <div>
              {campaignIds.map((campaignId: any) => {
                const campaignIdBigInt = BigInt(campaignId); // Convert to BigInt
                return (
                  <CampaignDetails key={campaignIdBigInt.toString()} campaignId={campaignIdBigInt} />
                );
              })}
            </div>
          ) : (
            <p className="text-center">No campaigns created yet.</p>
          )}
        </div>
      ) : (
        <p className="text-lg text-center">No wallet connected.</p>
      )}
    </div>
  );
}