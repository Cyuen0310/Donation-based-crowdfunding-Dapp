import { useReadContract, useActiveAccount } from "thirdweb/react";
import { defineChain, getContract } from "thirdweb";
import { client } from "./client";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useState } from "react";
import { DonationHistory } from "./components/DonationHistory";

export function CampaignDetails() {
  const { id } = useParams();
  const [donationAmount, setDonationAmount] = useState("");
  const account = useActiveAccount();

  const contract = getContract({
    client,
    chain: defineChain(11155111), // Sepolia
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d",
  });

  const { data: campaign, isPending } = useReadContract({
    contract,
    method:
      "function campaigns(uint256) view returns (address owner, string title, string description, uint256 target, uint256 duration, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
    params: [BigInt(id || "0")],
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
      </div>
    );
  }

  const [
    owner,
    title,
    description,
    target,
    duration,
    deadline,
    fundedAmount,
    numberOfBackers,
    isActive,
    isCollected,
  ] = campaign;

  const targetEth = Number(ethers.formatEther(target));
  const fundedEth = Number(ethers.formatEther(fundedAmount));
  const progress = (fundedEth / targetEth) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Campaign Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isActive ? "Ongoing" : "Ended"}
                    </span>
                    {isCollected && (
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Collected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{description}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-black mb-2">
                    <span>Raised: {fundedEth.toFixed(4)} ETH</span>
                    <span>Target: {targetEth.toFixed(4)} ETH</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm mt-1 text-gray-500">
                    {progress.toFixed(2)}% Funded
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-black">
                  <div>
                    <span className="block font-medium">Creator</span>
                    <span className="truncate">{`${owner.slice(
                      0,
                      6
                    )}...${owner.slice(-4)}`}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Backers</span>
                    <span>{numberOfBackers.toString()} people</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Deadline</span>
                    <span>
                      {new Date(Number(deadline) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation History 
            <DonationHistory contract={contract} campaignId={Number(id)} />*/}
          </div>

          <div className="md:col-span-1"></div>
        </div>
      </div>
    </div>
  );
}
