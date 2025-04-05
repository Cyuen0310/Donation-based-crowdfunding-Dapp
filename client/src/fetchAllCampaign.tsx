import React from "react";
import { useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { client } from "./client";
import CampaignCard from "./components/campaignCard";

function fetchAllCampaign() {
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
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
      {Array.from({ length: total }).map((_, id) => (
        <CampaignCard key={id} id={id} contract={contract} />
      ))}
    </div>
  );
}

export default fetchAllCampaign;
