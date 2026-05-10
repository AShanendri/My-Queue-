import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import BranchCard from "../../components/tenant/BranchCard";
import { useTenant } from "../../context/TenantContext";
import { legacyStorageKeys, readValue, storageKeys } from "../../utils/storage";
import { getBranchesForTenantSelection, getIndustryTypes } from "../../services/tenantSelectionService";
import { isNestedTenant } from "../../utils/tenantHelpers";
import client from "../../api/client";

export default function BranchSelection() {
  const {
    tenantType,
    tenant,
    theme,
    selectedOrganization,
    selectedOrganizationId,
    selectedBranch,
    setSelectedBranch,
  } = useTenant();
  const navigate = useNavigate();
  const queueFlowStarted =
    readValue(sessionStorage, storageKeys.queueFlowStarted(tenantType), [legacyStorageKeys.queueFlowStarted]) ===
    "true";
  const [searchTerm, setSearchTerm] = useState("");
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [industryTypes, setIndustryTypes] = useState([]);
  const [loadingIndustryTypes, setLoadingIndustryTypes] = useState(true);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [formData, setFormData] = useState({
    branchName: "",
    industryTypeId: "",
  });
  const [formError, setFormError] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);
  const nestedTenant = isNestedTenant(tenant);
  const fallbackSelectedOrganizationId = localStorage.getItem(
    `queueflow_${tenantType}_selectedOrganization_id`
  ) || "";
  const effectiveSelectedOrganizationId = String(
    selectedOrganizationId || fallbackSelectedOrganizationId || ""
  ).trim();

  useEffect(() => {
    let isMounted = true;

    const loadIndustryTypes = async () => {
      try {
        setLoadingIndustryTypes(true);
        const types = await getIndustryTypes();
        if (isMounted) {
          setIndustryTypes(types);
        }
      } catch (error) {
        console.error("Failed to load industry types:", error);
        if (isMounted) {
          setIndustryTypes([]);
        }
      } finally {
        if (isMounted) {
          setLoadingIndustryTypes(false);
        }
      }
    };

    loadIndustryTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      console.log("Checking Org ID:", effectiveSelectedOrganizationId);
      console.log("Fetching branches for ID:", selectedOrganizationId);

      if (nestedTenant && !effectiveSelectedOrganizationId) {
        setBranches([]);
        setLoadingBranches(false);
        setFetchError("");
        return;
      }

      try {
        setLoadingBranches(true);
        setFetchError("");

        const response = await getBranchesForTenantSelection({
          tenantType,
          organizationId: effectiveSelectedOrganizationId,
        });

        if (!isMounted) {
          return;
        }

        const fetchedBranches = Array.isArray(response) ? response : [];
        setBranches(fetchedBranches);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFetchError(error?.response?.data?.message || error?.message || "Failed to load branches");
        setBranches([]);
      } finally {
        if (isMounted) {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, [tenantType, selectedOrganizationId, effectiveSelectedOrganizationId, nestedTenant]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredBranches = branches
    .filter((branch) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      return String(branch.branchName || "").toLowerCase().includes(normalizedSearchTerm);
    })
    .sort((a, b) => {
      if (!normalizedSearchTerm) {
        return String(a.branchName || "").localeCompare(String(b.branchName || ""));
      }

      const aValue = String(a.branchName || "").toLowerCase();
      const bValue = String(b.branchName || "").toLowerCase();

      const getScore = (value) => {
        if (value === normalizedSearchTerm) {
          return 0;
        }

        if (value.startsWith(normalizedSearchTerm)) {
          return 1;
        }

        return 2;
      };

      return getScore(aValue) - getScore(bValue);
    });

  const activeSelectedBranch = useMemo(() => {
    if (!selectedBranch?.id) {
      return null;
    }

    return branches.find((branch) => String(branch.id) === String(selectedBranch.id)) || null;
  }, [branches, selectedBranch]);

  const handleBranchSelect = (branch) => {
    if (!queueFlowStarted) {
      return;
    }

    setSelectedBranch(branch);
  };

  const handleContinue = () => {
    if (!activeSelectedBranch?.id) {
      return;
    }

    navigate(`/${tenantType}/services`);
  };

  const handleOpenAddBranchModal = () => {
    setShowAddBranchModal(true);
    setFormError("");
    setFormData({ branchName: "", industryTypeId: "" });
  };

  const handleCloseAddBranchModal = () => {
    setShowAddBranchModal(false);
    setFormError("");
    setFormData({ branchName: "", industryTypeId: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSaveBranch = async () => {
    if (!formData.branchName.trim()) {
      setFormError("Branch name is required");
      return;
    }

    if (!formData.industryTypeId) {
      setFormError("Industry type is required");
      return;
    }

    setSavingBranch(true);
    setFormError("");

    try {
      const response = await client.post("/branches", {
        branchName: formData.branchName.trim(),
        organizationId: effectiveSelectedOrganizationId,
        industryTypeId: formData.industryTypeId,
      });

      if (response.data && response.data.branch) {
        const newBranch = {
          id: response.data.branch.id || response.data.branch._id,
          branchName: response.data.branch.branchName,
        };
        setBranches((prev) => [...prev, newBranch]);
        handleCloseAddBranchModal();
      }
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create branch");
    } finally {
      setSavingBranch(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PageHeader
            title={`Select a ${tenant.labels?.entitySingular || "Branch"}`}
            description={`Choose the ${tenant.labels?.entitySingular?.toLowerCase() || "branch"} you want to continue with.`}
          />

          <div className="w-full lg:w-72">
            <label
              htmlFor="branch-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Search {tenant.labels?.entitySingular || "Branch"}
            </label>
            <input
              id="branch-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tenant.labels?.entitySearchPlaceholder || "Type branch name..."}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                theme?.border || "border-blue-200"
              } ${theme?.ring || "focus:ring-blue-100"}`}
            />
          </div>
        </div>
        <div
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            theme?.light || "bg-blue-50"
          } ${theme?.text || "text-blue-700"}`}
        >
          Step 1 of 4
        </div>

        {nestedTenant && !effectiveSelectedOrganizationId && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No organization selected yet. Please choose an organization first.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredBranches.map((branch) => (
          <BranchCard
            key={branch.id}
            branch={branch.branchName}
            selected={activeSelectedBranch?.id === branch.id}
            onSelect={() => handleBranchSelect(branch)}
            theme={theme}
            disabled={!queueFlowStarted}
          />
        ))}
      </div>

      {queueFlowStarted && effectiveSelectedOrganizationId && (
        <div className="flex justify-center">
          <button
            onClick={handleOpenAddBranchModal}
            className={`rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition ${
              theme?.button || "bg-green-600 hover:bg-green-700"
            }`}
          >
            + Add New Branch
          </button>
        </div>
      )}

      {loadingBranches && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Loading branches...
        </div>
      )}

      {!loadingBranches && fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {!loadingBranches && !fetchError && filteredBranches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {nestedTenant && effectiveSelectedOrganizationId
            ? "No branches available for the selected organization."
            : "No branches match your search."}
        </div>
      )}

      {queueFlowStarted && activeSelectedBranch && (
        <div
          className={`rounded-3xl border p-5 shadow-sm sm:flex sm:items-center sm:justify-between ${
            theme?.border || "border-blue-200"
          } ${theme?.light || "bg-blue-50"}`}
        >
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                theme?.text || "text-blue-700"
              }`}
            >
              {tenant.labels?.selectedEntityLabel || "Selected Branch"}
            </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{activeSelectedBranch.branchName}</p>
          </div>

          <button
            onClick={handleContinue}
            className={`mt-4 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition sm:mt-0 sm:w-auto ${
              theme?.button || "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {!queueFlowStarted && (
        <button
          type="button"
          onClick={() => navigate(`/${tenantType}`)}
          className={`fixed bottom-5 right-5 z-40 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl md:bottom-6 md:right-6 ${
            theme?.button || "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Get Token
        </button>
      )}

      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">Add New Branch</h2>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="branch-name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Branch Name *
                </label>
                <input
                  id="branch-name"
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleFormChange}
                  placeholder="Enter branch name"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-4 ${
                    theme?.border || "border-blue-200"
                  } ${theme?.ring || "focus:ring-blue-100"}`}
                />
              </div>

              <div>
                <label htmlFor="industry-type" className="mb-2 block text-sm font-semibold text-slate-700">
                  Industry Type *
                </label>
                <select
                  id="industry-type"
                  name="industryTypeId"
                  value={formData.industryTypeId}
                  onChange={handleFormChange}
                  disabled={loadingIndustryTypes}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-4 disabled:bg-slate-100 ${
                    theme?.border || "border-blue-200"
                  } ${theme?.ring || "focus:ring-blue-100"}`}
                >
                  <option value="">
                    {loadingIndustryTypes ? "Loading industry types..." : "Select an industry type"}
                  </option>
                  {industryTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCloseAddBranchModal}
                disabled={savingBranch}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBranch}
                disabled={savingBranch || loadingIndustryTypes}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  theme?.button || "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {savingBranch ? "Saving..." : "Save Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}