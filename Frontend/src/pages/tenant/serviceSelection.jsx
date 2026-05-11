import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ServiceCard from "../../components/tenant/ServiceCard";
import { useTenant } from "../../context/TenantContext";
import { getWardsForBranch } from "../../services/tenantSelectionService";

export default function ServiceSelection() {
  const {
    tenantType,
    tenant,
    theme,
    selectedService,
    setSelectedService,
  } = useTenant();
  
  const navigate = useNavigate();
  const location = useLocation();
  const branchId = location.state?.branchId || "";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadWardsForBranch = async () => {
      if (!branchId || !tenantType) {
        setWards([]);
        setLoadingWards(false);
        return;
      }

      try {
        setLoadingWards(true);
        setFetchError("");

        const response = await getWardsForBranch(branchId);

        if (!isMounted) return;

        setWards(Array.isArray(response) ? response : []);
      } catch (error) {
        if (!isMounted) return;
        setFetchError(error?.response?.data?.message || error?.message || "Failed to load wards");
        setWards([]);
      } finally {
        if (isMounted) {
          setLoadingWards(false);
        }
      }
    };

    loadWardsForBranch();

    return () => {
      isMounted = false;
    };
  }, [tenantType, branchId]);

  // Filtering logic
  const filteredWards = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return wards
      .filter((w) => term === "" || w.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wards, searchTerm]);

  const activeSelectedWard = useMemo(() => {
    if (!selectedService?.id) return null;
    return wards.find((w) => String(w.id) === String(selectedService.id)) || null;
  }, [wards, selectedService]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Search Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageHeader
            title={tenant.labels?.wardSelectionTitle || "Available Wards/Counters"}
            description={tenant.labels?.wardSelectionDescription || "Select a ward or counter to get your token."}
          />
          <div className="w-full lg:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tenant.labels?.wardSearchPlaceholder || "Search wards..."}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${theme?.border} ${theme?.ring}`}
            />
          </div>
        </div>
      </div>

      {/* Wards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredWards.map((ward) => (
          <ServiceCard
            key={ward.id || ward.name}
            service={ward.name}
            selected={activeSelectedWard?.id === ward.id}
            onSelect={() => setSelectedService({ id: ward.id, serviceName: ward.name })}
            theme={theme}
          />
        ))}
      </div>

      {/* States */}
      {loadingWards && <div className="text-center p-10">Loading wards...</div>}
      {!loadingWards && fetchError && (
        <div className="text-center p-10 text-red-600 border border-red-200 bg-red-50 rounded-2xl">
          {fetchError}
        </div>
      )}
      {!loadingWards && filteredWards.length === 0 && !fetchError && (
        <div className="text-center p-10 text-slate-500 border border-dashed rounded-2xl">
          No wards found for this branch.
        </div>
      )}

      {/* Continue Action */}
      {activeSelectedWard && (
        <div className={`rounded-3xl border p-5 flex justify-between items-center ${theme?.border} ${theme?.light}`}>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Selected Ward</p>
            <p className="text-lg font-semibold">{activeSelectedWard.name}</p>
          </div>
          <button
            onClick={() => navigate(`/${tenantType}/book-token`)}
            className={`px-6 py-3 rounded-xl text-white font-semibold ${theme?.button}`}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}