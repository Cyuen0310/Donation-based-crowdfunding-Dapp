import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import {
  defineChain,
  getContract,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { client } from "./client";
import { useState } from "react";

export function CreateCampaign() {
  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: "0x6E2d1aC814648897cbd44131aDCA821986438aF1",
  });
  const account = useActiveAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const { mutate: sendTransaction } = useSendTransaction();

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>
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
          onClick={() => {
            const transaction = prepareContractCall({
              contract,
              method:
                "function createCampaign(string _title, string _description, uint256 _target, uint256 _duration) returns (uint256)",
              params: [title, description, BigInt(target), BigInt(duration)],
            });
            sendTransaction(transaction);
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </div>
  );
}
