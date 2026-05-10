import { useState } from "react";
import { useNavigate } from "react-router-dom";

const industries = [
  { value: "bank", label: "Bank" },
  { value: "hospital", label: "Hospital" },
  { value: "police", label: "Police" },
  { value: "supermarket", label: "Supermarket" },
  { value: "saloon", label: "Saloon" },
];

export default function AddBranch() {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleNext = () => {
    if (!selectedIndustry) return;

    // Navigate to the appropriate add branch page based on industry
    const routes = {
      bank: "/company-super-admin/add-bank-branch",
      hospital: "/hospital-super-admin/add-branch", // assuming exists
      police: "/police-super-admin/add-branch",
      supermarket: "/company-super-admin/add-supermarket-branch",
      saloon: "/saloon-super-admin/add-branch", // assuming exists
    };

    const route = routes[selectedIndustry];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Select Industry Type</h1>
      <p className="text-gray-600 mb-6">Choose the industry for the new branch.</p>

      <div className="space-y-3">
        {industries.map((industry) => (
          <label key={industry.value} className="flex items-center">
            <input
              type="radio"
              name="industry"
              value={industry.value}
              checked={selectedIndustry === industry.value}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="mr-3"
            />
            {industry.label}
          </label>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedIndustry}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Next
      </button>
    </div>
  );
}