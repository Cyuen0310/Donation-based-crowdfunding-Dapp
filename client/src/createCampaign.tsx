import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { client } from "./client";
import { useState } from "react";
import { parseEther } from "ethers"; // Use this to convert ETH → wei

export function CreateCampaign() {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const contract = getContract({
    client,
    chain: defineChain(11155111), // Sepolia
    address: "0x966c2a1d4664Bc1060544Fa369b2f4C1d9526D8d",
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState(""); // in ETH
  const [duration, setDuration] = useState(""); // in days

  const handleCreateCampaign = async () => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method:
          "function createCampaign(string _title, string _description, uint256 _target, uint256 _duration) returns (uint256)",
        params: [
          title,
          description,
          parseEther(target), // ETH to wei
          BigInt(duration),
        ],
      });

      sendTransaction(transaction, {
        onSuccess: (txResult) => {
          console.log("Transaction sent:", txResult);
          alert("Campaign created successfully!");
        },
        onError: (err) => {
          console.error("Transaction failed:", err);
          alert("Transaction failed!");
        },
      });
    } catch (error) {
      console.error("Error preparing transaction:", error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Campaign</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Campaign Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter campaign title"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter campaign description"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label
            htmlFor="target"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Amount (ETH)
          </label>
          <input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target amount in ETH"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Duration (days)
          </label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter campaign duration in days"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleCreateCampaign}
          disabled={isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </div>
  );
}
