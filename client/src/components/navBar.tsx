// components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom"; // if using react-router
import { client } from "../client";
import { ConnectButton } from "thirdweb/react";

export default function Navbar() {
  return (
    <nav className="bg-white text-black px-6 py-4 ">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-600">
          Daonation
        </Link>

        {/* Nav Links */}
        <div className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-violet-400 transition">
            Home
          </Link>
          <Link
            to="/createCampaign"
            className="hover:text-violet-400 transition"
          >
            Create
          </Link>
          <Link to="/campaignList" className="hover:text-violet-400 transition">
            Campaigns
          </Link>
          <Link to="/campaignList" className="hover:text-violet-400 transition">
            Dashboard
          </Link>
        </div>

        {/* Wallet/Connect Button Placeholder */}
        <div className="ml-auto md:ml-0">
          <ConnectButton
            theme="light"
            client={client}
            appMetadata={{
              name: "Example app",
              url: "https://example.com",
            }}
          />
        </div>
      </div>
    </nav>
  );
}
