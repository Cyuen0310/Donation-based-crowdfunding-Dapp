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
    owner: "0x1234567890abcdef1234567890abcdef12345678",
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
    owner: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Health Initiative",
    description: "Promote health and wellness in communities.",
    target: ethers.parseEther("15"),
    deadline: Math.floor(Date.now() / 1000) + 86400 * 45,
    fundedAmount: ethers.parseEther("5"),
    numberOfBackers: 10,
    isActive: true,
  },
];


function Donate({ campaignId }: { campaignId: number }) {
  const [amount, setAmount] = useState("");

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Support this Project</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter ETH amount"
          className="flex-1 p-2 border rounded"
          min="0.01"
          step="0.01"
        />
        <span className="whitespace-nowrap">ETH</span>
      </div>
      <button
        onClick={() => alert(`donation of ${amount} ETH to project ${campaignId}`)}
        className="mt-3 w-full py-2 px-4 rounded bg-green-600 hover:bg-green-700 text-white"
      >
        Donate Now
      </button>
    </div>
  );
}

export default function CampaignPage() {
  const ongoingCampaigns = mockCampaigns.filter(campaign => campaign.isActive);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Crowdfunding Project</h1>
      
      <div className="space-y-6">
        {ongoingCampaigns.map((campaign) => {
          const progress = Math.min(
            100,
            (Number(ethers.formatEther(campaign.fundedAmount)) /
              Number(ethers.formatEther(campaign.target))) * 100
          );

          return (
            <div key={campaign.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {campaign.title}
                  </h2>
                  <span className={`px-3 py-1 text-xs rounded-full bg-green-100 text-green-800`}>
                    Ongoing
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
                    <span>{campaign.numberOfBackers.toString()} people</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Deadline</span>
                    <span>
                      {new Date(Number(campaign.deadline) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Donate campaignId={campaign.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}