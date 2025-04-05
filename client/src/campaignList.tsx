import { useActiveAccount } from "thirdweb/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { client } from "./client";
import { defineChain } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: bigint;
  deadline: number;
  fundedAmount: bigint;
  numberOfBackers: number;
  isActive: boolean;
  isCollected: boolean;
}

interface Donation {
  id: number;
  amount: bigint;
}

export default function CampaignL() {
  const account = useActiveAccount();
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const backedCampaignIds = await readContract({
          contract,
          method: "function getBackedCampaigns(address) view returns (uint256[])",
          params: [account.address],
        });

        if (!backedCampaignIds || backedCampaignIds.length === 0) {
          setUserCampaigns([]);
          setUserDonations([]);
          setIsLoading(false);
          return;
        }

        const campaigns: Campaign[] = [];
        const donations: Donation[] = [];

        for (const id of backedCampaignIds) {
          try {
            const campaignData = await readContract({
              contract,
              method: "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
              params: [id],
            });

            if (campaignData) {
              campaigns.push({
                id: Number(id),
                owner: campaignData[0],
                title: campaignData[1],
                description: campaignData[2],
                target: campaignData[3],
                deadline: Number(campaignData[4]),
                fundedAmount: campaignData[5],
                numberOfBackers: Number(campaignData[6]),
                isActive: campaignData[7],
                isCollected: campaignData[8],
              });
            }

              const donationAmount = await readContract({
              contract,
              method: "function getContribution(uint256 _id, address _user) view returns (uint256)",
              params: [id, account.address],
            });

            if (donationAmount) {
              donations.push({
                id: Number(id),
                amount: donationAmount,
              });
            }
          } catch (err) {
            console.error(`Error processing campaign ${id}:`, err);
          }
        }

        setUserCampaigns(campaigns);
        setUserDonations(donations);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [account]);

  const formatDonation = (weiAmount: bigint) => {
    if (!weiAmount) return "0 ETH (0 wei)";
    const ethAmount = ethers.formatEther(weiAmount);
    return `${ethAmount} ETH (${weiAmount.toString()} Wei)`;
  };

  if (!account) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Please connect your wallet</h1>
        <p className="text-gray-600">You need to connect your wallet to view your donation records.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-400">Loading your donations...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8 text-red-500">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!userCampaigns || userCampaigns.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">No donation records found</h1>
        <p className="text-gray-600">You haven't donated to any campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-600">Your Donation Records</h1>
      
      <div className="space-y-6">
        {userCampaigns.map((campaign) => {
          const userDonation = userDonations.find(donation => donation.id === campaign.id);
          const progress = Number(campaign.target) > 0 
            ? Math.min(100, (Number(campaign.fundedAmount) / Number(campaign.target)) * 100)
            : 0;

          return (
            <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {campaign.title}
                  </h2>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      campaign.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {campaign.isActive ? "Ongoing" : "Ended"}
                    </span>
                    {campaign.isCollected && (
                      <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Collected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{campaign.description}</p>

                <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-400">Raised: {ethers.formatEther(campaign.fundedAmount)} ETH</span>
                    <span className="font-semibold text-gray-400">Target: {ethers.formatEther(campaign.target)} ETH</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                  <div>
                    <span className="block font-medium">Creator</span>
                    <span className="truncate">
                      {`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium">Backers</span>
                    <span>{campaign.numberOfBackers} people</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Deadline</span>
                    <span>
                      {new Date(campaign.deadline * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Your Donation</span>
                    <span>
                      {userDonation ? formatDonation(userDonation.amount) : "0 ETH (0 wei)"}
                    </span>
                  </div>
                </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
