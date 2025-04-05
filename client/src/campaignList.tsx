import { useState } from "react";
import { ethers } from "ethers";


const mockCampaigns = [
  {
    id: 1,
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Environmental Project",
    description: "Support environmental protection and reduce plastic usage.",
    target: ethers.parseEther("10"),
    deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    fundedAmount: ethers.parseEther("3"),
    numberOfBackers: 15,
    isActive: true,
  },
  {
    id: 2,
    owner: "0xabcdef1234567890abcdef1234567890abcdef12",
    title: "Education Project",
    description: "Provide educational resources to underprivileged areas.",
    target: ethers.parseEther("20"),
    deadline: Math.floor(Date.now() / 1000) + 86400 * 60,
    fundedAmount: ethers.parseEther("20"),
    numberOfBackers: 30,
    isActive: false,
  },
  {
    id: 3,
    owner: "0xabcdef9876543210abcdef1234567890abcdef12",
    title: "Health Initiative",
    description: "Promote health and wellness in communities.",
    target: ethers.parseEther("15"),
    deadline: Math.floor(Date.now() / 1000) + 86400 * 45,
    fundedAmount: ethers.parseEther("5"),
    numberOfBackers: 10,
    isActive: true,
  },
];

export default function CampaignL() {
  const [userDonations] = useState<{ id: number; amount: string }[]>([
    { id: 1, amount: ethers.formatEther(ethers.parseEther("1")) }, // 1 ETH to project 1
    { id: 2, amount: ethers.formatEther(ethers.parseEther("0.5")) }, // 0.5 ETH to project 2
    { id: 3, amount: ethers.formatEther(ethers.parseEther("2")) }, // 2 ETH to project 3
  ]);

  const userCampaigns = mockCampaigns.filter(campaign =>
    userDonations.some(donation => donation.id === campaign.id)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Donation Records</h1>
      
      <div className="space-y-6">
        {userCampaigns.map((campaign) => {
          const userDonation = userDonations.find(donation => donation.id === campaign.id);

          return (
            <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {campaign.title}
                  </h2>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    campaign.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {campaign.isActive ? "Ongoing" : "Ended"}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{campaign.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Raised: {ethers.formatEther(campaign.fundedAmount)} ETH</span>
                    <span>Target: {ethers.formatEther(campaign.target)} ETH</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (Number(ethers.formatEther(campaign.fundedAmount)) /
                         Number(ethers.formatEther(campaign.target))) * 100)}%` }}
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
                    <span>{campaign.numberOfBackers.toString()} people</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Deadline</span>
                    <span>
                      {new Date(Number(campaign.deadline) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Your Donation</span>
                    <span>{userDonation ? userDonation.amount : "0"} ETH</span>
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