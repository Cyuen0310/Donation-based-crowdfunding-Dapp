import React, { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

interface DonationFormProps {
  contract: any;
  campaignId: number;
  isActive: boolean;
  isCollected: boolean;
}

export default function DonationForm({
  contract,
  campaignId,
  isActive,
  isCollected,
}: DonationFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const account = useActiveAccount();

  const { mutate: sendTransaction } = useSendTransaction();

  // Get campaign details to check owner
  const { data: campaign } = useReadContract({
    contract,
    method:
      "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
    params: [BigInt(campaignId)],
  });

  // Check if current wallet is the owner
  useEffect(() => {
    if (account?.address && campaign) {
      const owner = campaign[0];
      setIsOwner(owner.toLowerCase() === account.address.toLowerCase());
    }
  }, [account?.address, campaign]);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        if (isSuccess) {
          navigate("/dashboard");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showModal, isSuccess, navigate]);

  const handleDonate = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // @ts-ignore - Type mismatch between thirdweb versions
      const transaction = prepareContractCall({
        contract,
        method: "function backCampaign(uint256 _id) payable",
        params: [BigInt(campaignId)],
        value: ethers.parseEther(amount),
      });

      // Send the transaction
      sendTransaction(transaction, {
        onSuccess: () => {
          setIsSuccess(true);
          setModalTitle("Donation Successful!");
          setModalContent(
            `You have successfully donated ${amount} ETH to this campaign.`
          );
          setShowModal(true);
          setAmount("");
          setIsLoading(false);
        },
        onError: (err) => {
          console.error("Donation error:", err);
          setError("Failed to process donation. Please try again.");
          setIsSuccess(false);
          setModalTitle("Donation Failed");
          setModalContent(
            "There was an error processing your donation. Please try again."
          );
          setShowModal(true);
          setIsLoading(false);
        },
      });
    } catch (err) {
      console.error("Donation error:", err);
      setError("Failed to prepare donation. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-black ">
          Support this Campaign
        </h2>

        {!isActive ? (
          <div className="text-red-500 mb-4">This campaign has ended.</div>
        ) : isOwner ? (
          <div className="text-red-500 mb-4">
            You cannot donate to your own campaign.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-black mb-1"
              >
                Amount (ETH)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0.001"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <button
              onClick={handleDonate}
              disabled={isLoading || !isActive || isCollected || isOwner}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading || !isActive || isCollected || isOwner
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {isLoading ? "Waiting for confirmation..." : "Donate Now"}
            </button>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => {}} title={modalTitle}>
        <div
          className={`text-center ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          <p className="mb-4">{modalContent}</p>
        </div>
      </Modal>
    </>
  );
}
