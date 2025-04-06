import { ConnectButton, useActiveAccount } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CreateCampaign } from "./createCampaign";
import CampaignList from "./campaignList";
import DonateForm from "./donateForm";
import OwnCampaignList from "./ownCampaign";
import Navbar from "./components/navBar";
import FetchAllCampaign from "./fetchAllCampaign";

export function App() {
  const userwallet = useActiveAccount();
  useEffect(() => {
    console.log(userwallet);
  }, [userwallet]);

  return (
    <Router>
      <main className="p-4 pb-10 min-h-[100vh] container max-w-screen-xl mx-auto bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<FetchAllCampaign />} />
          <Route path="/createCampaign" element={<CreateCampaign />} />
          <Route path="/campaignList" element={<CampaignList />} />
          <Route path="/dashboard" element={<OwnCampaignList />} />
        </Routes>
      </main>
    </Router>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20">
      <img
        src={thirdwebIcon}
        alt="Thirdweb Logo"
        className="size-[150px] md:size-[150px]"
        style={{ filter: "drop-shadow(0px 0px 24px #a726a9a8)" }}
      />
      <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-6 text-zinc-100">
        thirdweb SDK
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        <span className="inline-block -skew-x-6 text-violet-500"> vite </span>
      </h1>
      <p className="text-zinc-300 text-base">
        Read the{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          README.md
        </code>{" "}
        file to get started.
      </p>
    </header>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={`${props.href}?utm_source=vite-template`}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
      rel="noreferrer"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}
