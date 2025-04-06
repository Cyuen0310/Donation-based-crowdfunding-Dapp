import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { client } from "./client";
import { useState } from "react";
import { parseEther } from "ethers";

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
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");

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
        params: [title, description, parseEther(target), BigInt(duration)],
      });

      sendTransaction(transaction, {
        onSuccess: (txResult) => {
          console.log("Transaction sent:", txResult);
          alert("Campaign created successfully!");
          setTitle("");
          setDescription("");
          setTarget("");
          setDuration("");
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-600">
        Create New Campaign
      </h1>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Campaign Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter campaign title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter campaign description"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Target Amount (ETH)
                </label>
                <input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0.1"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Duration (days)
                </label>
                <input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={
                  isPending || !title || !description || !target || !duration
                }
                className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  isPending || !title || !description || !target || !duration
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Campaign...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
