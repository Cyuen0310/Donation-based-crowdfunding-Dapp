import React from "react";
import { useReadContract } from "thirdweb/react";
import { ethers } from "ethers";

interface DonationHistoryProps {
  campaignId: number;
  contract: any;
}

export function DonationHistory({
  campaignId,
  contract,
}: DonationHistoryProps) {
  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function getAllContributions(uint256 _id) view returns (address[], uint256[])",
    params: [BigInt(campaignId)],
  });

  if (isPending) {
    return (
      <div className="animate-pulse bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Donation History
        </h2>
        <p className="text-red-500">Error loading donation history</p>
      </div>
    );
  }

  if (!data || data[0].length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Donation History
        </h2>
        <p className="text-gray-500">No donations yet</p>
      </div>
    );
  }

  const [contributors, amounts] = data;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Donation History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contributor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contributors.map((contributor, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {`${contributor.slice(0, 6)}...${contributor.slice(-4)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Number(ethers.formatEther(amounts[index])).toFixed(6)} ETH
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
