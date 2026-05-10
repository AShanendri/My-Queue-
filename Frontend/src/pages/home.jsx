import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TenantCard from "../components/home/TenantCard";
import { getIndustryTypes } from "../services/industryTypeService";

export default function Home() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadIndustries = async () => {
      try {
        setError("");
        setLoading(true);
        const industryTypes = await getIndustryTypes();

        if (!isMounted) {
          return;
        }

        setIndustries(Array.isArray(industryTypes) ? industryTypes : []);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }

        setError(
          fetchError?.response?.data?.message || fetchError?.message ||
            "Unable to load industries."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadIndustries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnterIndustry = (industry) => {
    const industryId = industry?._id || industry?.id || "";
    const industryCode = industry?.code || industry?.name?.toLowerCase().replace(/\s+/g, "-");

    if (!industryId || !industryCode) {
      console.error("Invalid industry selection:", industry);
      return;
    }

    localStorage.setItem("queueflow_selectedIndustryTypeId", industryId);
    localStorage.setItem("queueflow_selectedIndustryCode", industryCode);
    navigate(`/${industryCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl rounded-[32px] bg-gradient-to-r from-blue-100 via-green-100 via-indigo-100 to-orange-100 p-[2px] shadow-sm">
          <div className="rounded-[30px] bg-white p-7 text-center sm:p-10">
            <div className="inline-flex rounded-full bg-gradient-to-r from-blue-100 via-green-100 via-indigo-100 to-orange-100 p-[1px] shadow-sm">
              <div className="rounded-full border border-white/70 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-800">
                Multi-Tenant Queue Platform
              </div>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Select a Service Domain
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Choose a vertical to start the queue experience with the correct dashboard and flow.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Dynamic Industries</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Admin-driven</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">Quick access</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Loading industries...</p>
              <p className="mt-2 text-sm text-slate-500">Please wait while the available domains are retrieved.</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          ) : industries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">No industries found</p>
              <p className="mt-2 text-sm text-slate-500">Please add industries from the Admin Panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {industries.map((industry) => (
                <TenantCard
                  key={industry._id || industry.id || industry.code || industry.name}
                  title={industry.name}
                  description={industry.description || "Tap enter to launch this industry dashboard."}
                  routeKey={industry.code}
                  onEnter={() => handleEnterIndustry(industry)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
