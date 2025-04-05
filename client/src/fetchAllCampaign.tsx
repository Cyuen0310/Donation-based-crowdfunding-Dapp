import React from "react";
import { useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { client } from "./client";
import CampaignCard from "./components/campaignCard";

function FetchAllCampaign() {
  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d",
  });

  const { data, isPending } = useReadContract({
    contract,
    method: "function TotalCampaigns() view returns (uint256)",
    params: [],
  });
  const total = Number(data || 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">All Campaigns</h1>

      {isPending ? (
        <p className="text-center">Loading campaigns...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: total }).map((_, id) => (
            <CampaignCard key={id} id={id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FetchAllCampaign;