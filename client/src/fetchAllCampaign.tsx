import React from "react";
import { useReadContract } from "thirdweb/react";
import { getContract, defineChain } from "thirdweb";
import { client } from "./client";

function fetchAllCampaign() {
  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x6E2d1aC814648897cbd44131aDCA821986438aF1",
  });

  const { data, isPending } = useReadContract({
    contract,
    method: "function TotalCampaigns() view returns (uint256)",
    params: [],
  });

  return (
    <>
      <div>
        <h1>Total Campaigns: {Number(data)}</h1>
      </div>
    </>
  );
}

export default fetchAllCampaign;
