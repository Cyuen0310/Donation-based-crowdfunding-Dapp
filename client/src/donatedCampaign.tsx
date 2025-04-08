import { useActiveAccount } from "thirdweb/react";
import { useState, useEffect } from "react";
import { client } from "./client";
import { defineChain } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
import CampaignCard from "./components/campaignCard";

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

// fetch the donated campaigns of the user
export default function CampaignL() {
  const account = useActiveAccount();
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x682103fE1dB26B93d411CED5994d5C759A1F5cdB",
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
          method:
            "function getBackedCampaigns(address) view returns (uint256[])",
          params: [account.address],
        });

        if (!backedCampaignIds || backedCampaignIds.length === 0) {
          setUserCampaigns([]);
          setUserDonations([]);
          setIsLoading(false);
          return;
        }

        const uniqueCampaignIds = new Set<number>();
        const campaigns: Campaign[] = [];
        const donations: Donation[] = [];

        for (const id of backedCampaignIds) {
          uniqueCampaignIds.add(Number(id));
        }

        for (const id of uniqueCampaignIds) {
          try {
            const campaignData = await readContract({
              contract,
              method:
                "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
              params: [BigInt(id)],
            });

            if (campaignData) {
              campaigns.push({
                id,
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
              method:
                "function getContribution(uint256 _id, address _user) view returns (uint256)",
              params: [BigInt(id), account.address],
            });

            if (donationAmount) {
              donations.push({
                id,
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-black">
        Loading your donations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!userCampaigns || userCampaigns.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-black">
        No donation records found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Your Donation Records
      </h1>

      <div className="space-y-6">
        {userCampaigns.map((campaign) => {
          const userDonation = userDonations.find(
            (donation) => donation.id === campaign.id
          );

          return (
            <CampaignCard
              key={campaign.id}
              {...campaign}
              donationAmount={userDonation?.amount}
            />
          );
        })}
      </div>
    </div>
  );
}
