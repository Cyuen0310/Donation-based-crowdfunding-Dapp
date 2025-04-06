import React from "react";
import { Link } from "react-router-dom";
import { client } from "../client";
import { ConnectButton, useActiveAccount } from "thirdweb/react";

export default function Navbar() {
  const userwallet = useActiveAccount();

  return (
    <nav className="bg-white text-black px-6 py-4 w-full border-b border-gray-200">
      <div className="w-full flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-green-600">
          Daonation
        </Link>

        <div className="space-x-6 hidden md:flex">
          <Link
            to="/"
            className="hover:text-green-800 transition text-lg font-bold"
          >
            Home
          </Link>

          {userwallet && (
            <>
              <Link
                to="/dashboard"
                className="hover:text-green-800 transition text-lg font-bold"
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
