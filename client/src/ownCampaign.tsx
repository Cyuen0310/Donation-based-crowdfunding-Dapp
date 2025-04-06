// OwnCampaign.tsx
import React from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { defineChain } from "thirdweb";
import { client } from "./client";
import CampaignCard from "./components/campaignCard";

export default function OwnCampaign() {
  const account = useActiveAccount();

  const contractConfig = {
    client: client,
    chain: defineChain(11155111), // Sepolia
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d" as `0x${string}`,
  };

  const {
    data: campaignIds,
    isLoading: isLoadingIds,
    error: errorIds,
  } = useReadContract({
    contract: contractConfig,
    method:
      "function getCreatedCampaigns(address _owner) view returns (uint256[])",
    params: [account?.address || ""],
  });

  const CampaignDetails = ({ campaignId }: { campaignId: bigint }) => {
    const { data, isLoading, error } = useReadContract({
      contract: contractConfig,
      method:
        "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
      params: [campaignId],
    });

    if (isLoading) return <p>Loading campaign details...</p>;
    if (error)
      return (
        <p className="text-red-500">
          Error fetching campaign details: {error.message}
        </p>
      );
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
        id={Number(campaignId)}
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
      <h1 className="text-3xl font-bold mb-8 text-center">Your Campaigns</h1>
      {account ? (
        <div>
          <p className="text-lg text-center">
            Your Wallet Address: {account.address}
          </p>
          {isLoadingIds ? (
            <p className="text-center">Loading campaign IDs...</p>
          ) : errorIds ? (
            <p className="text-center text-red-500">
              Error fetching campaign IDs: {errorIds.message}
            </p>
          ) : campaignIds && campaignIds.length > 0 ? (
            <div>
              {campaignIds.map((campaignId: any) => {
                const campaignIdBigInt = BigInt(campaignId);
                return (
                  <CampaignDetails
                    key={campaignIdBigInt.toString()}
                    campaignId={campaignIdBigInt}
                  />
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
