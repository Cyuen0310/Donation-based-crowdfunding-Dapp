import React from "react";
import { useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { client } from "./client";
import CampaignCard from "./components/campaignCard";

function FetchAllCampaign() {
  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x682103fE1dB26B93d411CED5994d5C759A1F5cdB",
  });

  // fetch the total number of campaigns
  const { data, isPending } = useReadContract({
    contract,
    method: "function TotalCampaigns() view returns (uint256)",
    params: [],
  });

  const total = Number(data || 0);

  // fetch campaign details by its id
  const CampaignDetails = ({ campaignId }: { campaignId: number }) => {
    const { data, isPending, error } = useReadContract({
      contract,
      method:
        "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
      params: [BigInt(campaignId)],
    });

    if (isPending)
      return <div className="animate-pulse h-48 bg-gray-200 rounded-xl"></div>;
    if (error)
      return <div className="text-red-500">Error loading campaign</div>;
    if (!data) return null;

    const [
      owner,
      title,
      description,
      target,
      deadline,
      fundedAmount,
      numberOfBackers,
      isActive,
      isCollected,
    ] = data;

    return (
      <CampaignCard
        id={campaignId}
        title={title}
        description={description}
        owner={owner}
        target={target}
        deadline={Number(deadline)}
        fundedAmount={fundedAmount}
        numberOfBackers={Number(numberOfBackers)}
        isActive={isActive}
        isCollected={isCollected}
      />
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        All Campaigns
      </h1>

      {isPending ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-48 bg-gray-200 rounded-xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: total }).map((_, id) => (
            <CampaignDetails key={id} campaignId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FetchAllCampaign;
