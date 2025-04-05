import React from "react";
import { useReadContract } from "thirdweb/react";
import { ethers } from "ethers";

type CampaignCardProps = {
  id: number;
  contract: any;
};

export default function CampaignCard({ id, contract }: CampaignCardProps) {
  const { data, isPending } = useReadContract({
    contract,
    method:
      "function campaigns(uint256) view returns (address owner, string title, string description, uint256 target, uint256 duration, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
    params: [BigInt(id)],
  });

  if (isPending) return <div>Loading campaign #{id}...</div>;
  if (!data) return <div>Error loading campaign #{id}</div>;

  // Destructure the array elements
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
  ] = data;

  return (
    <div className="border border-zinc-700 p-4 mb-4 bg-white text-black rounded-lg">
      <h3 className="text-lg font-bold">{title}</h3>
      <p>{description}</p>
      <p>🎯 Target: {ethers.formatEther(target)} ETH</p>
      <p>💰 Raised: {ethers.formatEther(fundedAmount)} ETH</p>
      <p>👥 Backers: {numberOfBackers.toString()}</p>
      <p>Status: {isActive ? "🟢 Active" : "🔴 Ended"}</p>
    </div>
  );
}
