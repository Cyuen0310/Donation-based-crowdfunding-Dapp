import { useActiveAccount, useReadContract } from "thirdweb/react";
import { defineChain, getContract } from "thirdweb";
import { client } from "./client";
import CampaignCard from "./components/campaignCard";

export default function OwnCampaign() {
  const account = useActiveAccount();

  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x682103fE1dB26B93d411CED5994d5C759A1F5cdB",
  });

  const {
    data: campaigns,
    isLoading: isLoading,
    error: error,
  } = useReadContract({
    contract: contract,
    method:
      "function getCreatedCampaigns(address _owner) view returns (uint256[])",
    params: [account?.address || ""],
  });

  const CampaignDetails = ({ campaignId }: { campaignId: bigint }) => {
    const { data, isLoading, error } = useReadContract({
      contract: contract,
      method:
        "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
      params: [campaignId],
    });

    if (isLoading) return <p>Loading campaign details...</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
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
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Your Campaigns
      </h1>
      {account ? (
        <div>
          {isLoading ? (
            <p className="text-center text-black text-lg">
              Loading campaigns ...
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error.message}</p>
          ) : campaigns && campaigns.length > 0 ? (
            <div>
              {campaigns.map((campaignId: any) => {
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
            <p className="text-center text-black">No campaigns created yet.</p>
          )}
        </div>
      ) : (
        <p className="text-lg text-center">No wallet connected.</p>
      )}
    </div>
  );
}
