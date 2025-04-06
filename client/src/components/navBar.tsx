import React from "react";
import { Link } from "react-router-dom";
import { client } from "../client";
import { ConnectButton, useActiveAccount } from "thirdweb/react";

export default function Navbar() {
  const userwallet = useActiveAccount();

  return (
    <nav className="bg-white text-black px-6 py-4 ">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-600">
          Daonation
        </Link>

        <div className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-violet-400 transition">
            Home
          </Link>

          {userwallet && (
            <>
              <Link
                to="/createCampaign"
                className="hover:text-violet-400 transition"
              >
                Create
              </Link>
              <Link
                to="/campaignList"
                className="hover:text-violet-400 transition"
              >
                Campaigns
              </Link>
              <Link
                to="/dashboard"
                className="hover:text-violet-400 transition"
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto md:ml-0">
          <ConnectButton
            theme="light"
            client={client}
            appMetadata={{
              name: "Daonation",
              url: "https://daonation.com",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
