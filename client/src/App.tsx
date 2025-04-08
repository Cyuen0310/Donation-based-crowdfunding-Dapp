import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CreateCampaign } from "./createCampaign";
import Navbar from "./components/navBar";
import FetchAllCampaign from "./fetchAllCampaign";
import Dashboard from "./Dashboard";
import { CampaignDetails } from "./components/campaignDetails";

export function App() {
  return (
    <Router>
      <main className="p-4 pb-10 min-h-[100vh] container max-w-screen-xl mx-auto bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<FetchAllCampaign />} />
          <Route path="/createCampaign" element={<CreateCampaign />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
        </Routes>
      </main>
    </Router>
  );
}
