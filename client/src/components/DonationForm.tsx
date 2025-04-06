import React, { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
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
  const navigate = useNavigate();

  const { mutate: sendTransaction } = useSendTransaction();

  // Auto-close modal after 2 seconds
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
        <h2 className="text-xl font-bold mb-4">Support this Campaign</h2>

        {!isActive ? (
          <div className="text-red-500 mb-4">This campaign has ended.</div>
        ) : isCollected ? (
          <div className="text-amber-500 mb-4">Funds have been collected.</div>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <button
              onClick={handleDonate}
              disabled={isLoading || !isActive || isCollected}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading || !isActive || isCollected
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
