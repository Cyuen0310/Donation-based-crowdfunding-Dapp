import React from "react";
import { ethers } from "ethers";

interface CampaignCardProps {
  id: number;
  title: string;
  description: string;
  owner: string;
  target: bigint;
  fundedAmount: bigint;
  deadline: number;
  numberOfBackers: number;
  isActive: boolean;
  isCollected: boolean;
  donationAmount?: bigint;
}

const CampaignCard = ({
  id,
  title,
  description,
  owner,
  target,
  fundedAmount,
  deadline,
  numberOfBackers,
  isActive,
  isCollected,
  donationAmount,
}: CampaignCardProps) => {
  const targetEth = Number(ethers.formatEther(target));
  const fundedEth = Number(ethers.formatEther(fundedAmount));
  const progress =
    targetEth > 0
      ? (fundedEth / targetEth) * 100
      : fundedEth > 0
      ? Infinity
      : 0;

  const displayProgress = isFinite(progress) ? progress.toFixed(2) : "∞";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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

        <p className="text-gray-600 mb-4">{description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-black mb-2">
            <span>Raised: {fundedEth} ETH</span>
            <span>Target: {targetEth} ETH</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-sm mt-1 text-gray-500">
            {displayProgress}% Funded
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-black mb-4">
          <div>
            <span className="block font-medium">Creator</span>
            <span className="truncate">{`${owner.slice(0, 6)}...${owner.slice(
              -4
            )}`}</span>
          </div>
          <div>
            <span className="block font-medium">Backers</span>
            <span>{numberOfBackers.toString()} people</span>
          </div>
          <div className="col-span-2">
            <span className="block font-medium">Deadline</span>
            <span>{new Date(deadline * 1000).toLocaleString()}</span>
          </div>
          {donationAmount !== undefined && (
            <div className="col-span-2">
              <span className="block font-medium">Your Donation</span>
              <span>{ethers.formatEther(donationAmount)} ETH</span>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => (window.location.href = `/campaign/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
