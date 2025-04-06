import React, { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
  ConnectButton,
} from "thirdweb/react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { client } from "../client";

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
  const [showConnectModal, setShowConnectModal] = useState(false);
  const navigate = useNavigate();
  const account = useActiveAccount();

  const { mutate: sendTransaction } = useSendTransaction();

  const { data: campaign } = useReadContract({
    contract,
    method:
      "function getCampaign(uint256 _id) view returns (address owner, string title, string description, uint256 target, uint256 deadline, uint256 fundedAmount, uint256 numberOfBackers, bool isActive, bool isCollected)",
    params: [BigInt(campaignId)],
  });

  useEffect(() => {
    if (account?.address && campaign) {
      const owner = campaign[0];
      setIsOwner(owner.toLowerCase() === account.address.toLowerCase());
    }
  }, [account?.address, campaign]);

  useEffect(() => {
    if (account?.address && showConnectModal) {
      const timer = setTimeout(() => {
        setShowConnectModal(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [account?.address, showConnectModal]);

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
    if (!account) {
      setShowConnectModal(true);
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const transaction = prepareContractCall({
        contract,
        method: "function backCampaign(uint256 _id) payable",
        params: [BigInt(campaignId)],
        value: ethers.parseEther(amount),
      });

      sendTransaction(transaction as any, {
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
        <h2 className="text-xl font-bold mb-4 text-black">
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

      <Modal
        isOpen={showModal}
        onClose={() => {}}
        title={modalTitle}
        titleColor="text-black"
      >
        <div
          className={`text-center ${
            isSuccess ? "text-green-500" : "text-red-600"
          }`}
        >
          <p className="mb-4">{modalContent}</p>
        </div>
      </Modal>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Connect Your Wallet
              </h3>
            </div>

            <div className="flex justify-center mb-6">
              <ConnectButton client={client} theme="light" />
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-center">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
