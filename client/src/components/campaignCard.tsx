// CampaignCard.tsx
import React, { useState } from 'react';
import { formatEther, parseEther } from 'ethers';
import { useReadContract, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from "thirdweb";
import { ContractInterface } from "ethers"; // Import ContractInterface

interface CampaignCardProps {
  id: number;
  contract: any; // Keep as 'any' for now, since we're avoiding the ABI
}

const CampaignCard: React.FC<CampaignCardProps> = ({ id, contract }) => {
  const { data, isLoading, error } = useReadContract({
    contract: contract,
    method:
      "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
    params: [BigInt(id)],
  });

  const [donationAmount, setDonationAmount] = useState('');
  const { mutate: sendTransaction, status: donationStatus, error: transactionError } = useSendTransaction();

  if (isLoading) {
    return <p>Loading campaign details...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Error fetching campaign details: {error.message}
      </p>
    );
  }

  if (!data) {
    return null; // Or display a message if no data is found
  }

  const [owner, title, description, target, deadline, fundedAmount, numberOfBackers, isActive, isCollected] = data;

  // Convert BigInt values to numbers for progress calculation
  const targetEther = target ? Number(formatEther(target.toString())) : 0;
  const fundedAmountEther = fundedAmount ? Number(formatEther(fundedAmount.toString())) : 0;

  // Calculate percentage, handling cases where target is zero
  let progress: number;
  if (targetEther > 0) {
    progress = (fundedAmountEther / targetEther) * 100; // Remove Math.min(100, ...)
  } else if (fundedAmountEther > 0) {
    // If target is zero but fund is raised, consider it infinite percent
    progress = Infinity;
  } else {
    progress = 0; // If both are zero
  }

  let displayProgress = isFinite(progress) ? progress.toFixed(2) : "∞";

  const handleDonate = async () => {
    try {
      // Validate donationAmount is not empty and is a valid number
      if (!donationAmount) {
        alert("Please enter a donation amount.");
        return;
      }

      // Convert donationAmount to Wei (bigint)
      const donationValue = parseEther(donationAmount);

      // **Explicitly Define Transaction Type**
      const transaction: any = await prepareContractCall({ // Changed type here
        contract: contract,
        method: "function backCampaign(uint256 _id) payable",
        params: [BigInt(id)], // Use BigInt here too
        value: donationValue, // Send the donation amount in Wei
      });

      sendTransaction(transaction, { // Add error handling to sendTransaction
          onSuccess: (tx) => {
              alert("Donation successful!");
              console.log("Transaction:", tx);
          },
          onError: (err: any) => {
              alert(`Donation failed: ${err.message}`);
              console.error("Transaction error:", err);
          },
      });
    } catch (err: any) {
      console.error("Failed to prepare transaction", err);
      alert(`Error preparing transaction: ${err.message}`);
    }
  };

  // Hardcoded Donate Form
  const DonateForm = () => (
    <div className="bg-gray-50 rounded-xl p-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Support this Project</h3>
      <div className="flex items-center border rounded-md overflow-hidden mb-3">
        <input
          type="number"
          placeholder="Enter ETH amount"
          className="w-full p-2 text-gray-700 focus:outline-none"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
        />
        <span className="bg-gray-200 px-3 py-2 text-gray-500">ETH</span>
      </div>
      <button
        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none"
        onClick={handleDonate}
        disabled={donationStatus === "pending"}
      >
        {donationStatus === "pending" ? "Donating..." : "Donate Now"}
      </button>
      {transactionError && (
        <div className="text-red-500 mt-2">
          Error: {transactionError.message}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span
            className={`px-3 py-1 text-xs rounded-full ${
              isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {isActive ? "Ongoing" : "Ended"}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Raised: {fundedAmount ? formatEther(fundedAmount.toString()) : "0"} ETH</span>
            <span>Target: {target ? formatEther(target.toString()) : "0"} ETH</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="text-sm mt-1 text-gray-500">
            {displayProgress}% Funded
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
          <div>
            <span className="block font-medium">Creator</span>
            <span className="truncate">{`${owner.slice(0, 6)}...${owner.slice(-4)}`}</span>
          </div>
          <div>
            <span className="block font-medium">Backers</span>
            <span>{numberOfBackers.toString()} people</span>
          </div>
          <div className="col-span-2">
            <span className="block font-medium">Deadline</span>
            <span>{new Date(Number(deadline) * 1000).toLocaleString()}</span>
          </div>
          <div className="col-span-2">
            <span className="block font-medium">Your Donation</span>
            <span>0 ETH</span> {/*  Placeholder */}
          </div>
        </div>
        {/* Donate Form */}
        <DonateForm />
      </div>
    </div>
  );
};

export default CampaignCard;