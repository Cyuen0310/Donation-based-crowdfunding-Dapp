import React, { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import DonatedCampaign from "./donatedCampaign";
import CreatedCampaign from "./createdCampaign";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("created");
  const userwallet = useActiveAccount();

  if (!userwallet) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
        <p className="text-gray-600">
          You need to connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <button
          onClick={() => (window.location.href = "/createCampaign")}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          Create Campaign
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("created")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "created"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Created Campaigns
            </button>
            <button
              onClick={() => setActiveTab("backed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "backed"
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Donated Campaigns
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "created" ? <CreatedCampaign /> : <DonatedCampaign />}
      </div>
    </div>
  );
}
