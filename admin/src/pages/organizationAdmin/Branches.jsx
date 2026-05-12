import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBranches } from "../../services/branchService";
import { getMyBranchRequests } from "../../services/branchRequestService";
import api from "../../services/api";

// Shared organization-admin page for tenant-scoped branch management.
export default function SharedOrganizationAdminBranches() {
  const navigate = useNavigate();
  const { tenantType, organizationId, divisionId } = useAuth();
  const [branches, setBranches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [wards, setWards] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [wardError, setWardError] = useState(null);
  const [wardFormData, setWardFormData] = useState({ name: "", description: "" });
  const [savingWard, setSavingWard] = useState(false);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const [branchesResponse, pendingResponse] = await Promise.all([
          getBranches(),
          getMyBranchRequests(),
        ]);

        if (branchesResponse.success) {
          setBranches(branchesResponse.branches || []);
        } else {
          setError(branchesResponse.message || "Failed to load branches");
        }

        if (pendingResponse.success) {
          setPendingRequests(pendingResponse.branchRequests || []);
        } else {
          setError(
            pendingResponse.message ||
              branchesResponse.message ||
              "Failed to load pending branch requests"
          );
        }
      } catch (err) {
        setError(err?.message || "Error loading branches and pending requests");
        setBranches([]);
        setPendingRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  const handleAddBranch = () => {
    navigate("/organization-admin/add-branch");
  };

  const handleSelectBranch = async (branchId) => {
    setSelectedBranchId(branchId);
    setWardLoading(true);
    setWardError(null);
    
    try {
      const { data } = await api.get(`/branches/${branchId}/wards`);
      setWards(Array.isArray(data?.wards) ? data.wards : []);
    } catch (err) {
      setWardError(err?.response?.data?.message || "Failed to load wards");
      setWards([]);
    } finally {
      setWardLoading(false);
    }
  };

  const handleAddWard = async () => {
    if (!wardFormData.name.trim() || !selectedBranchId) {
      setWardError("Ward name is required");
      return;
    }

    setSavingWard(true);
    setWardError(null);

    try {
      const { data } = await api.post(`/branches/${selectedBranchId}/wards`, {
        name: wardFormData.name.trim(),
        description: wardFormData.description.trim(),
      });

      if (data?.ward) {
        setWards([...wards, data.ward]);
        setWardFormData({ name: "", description: "" });
      }
    } catch (err) {
      setWardError(err?.response?.data?.message || "Failed to create ward");
    } finally {
      setSavingWard(false);
    }
  };

  const handleDeleteWard = async (wardId) => {
    const id = wardId || "";
    if (!id || !window.confirm("Delete this ward/counter?")) return;

    setWardError(null);
    try {
      await api.delete(`/branches/wards/${id}`);
      setWards((prev) => prev.filter((w) => String(w._id || w.id) !== String(id)));
    } catch (err) {
      setWardError(err?.response?.data?.message || "Failed to delete ward");
    }
  };

  const formatStatusLabel = (status) => status?.charAt(0).toUpperCase() + status?.slice(1);
  const formatCreatedAt = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Branches</h1>
          <p className="mt-2 text-sm text-slate-500">Manage branches in your organization</p>
        </div>
        <button
          onClick={handleAddBranch}
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          + Add Branch
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">Loading branches...</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && branches.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No branches yet. Create one to get started.</p>
        </div>
      )}

      {!loading && branches.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Active Branches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Branch Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">City</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Industry Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Contact</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{branch.branchName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs">{branch.branchCode || "—"}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{branch.city || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {branch.industryType?.name || branch.industryType?.code || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          branch.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {formatStatusLabel(branch.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{branch.contactNumber || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSelectBranch(branch.id)}
                        className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          selectedBranchId === branch.id
                            ? "bg-sky-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {selectedBranchId === branch.id ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedBranchId && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Add Ward/Counter to {branches.find((b) => b.id === selectedBranchId)?.branchName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Create and manage wards/counters for this branch</p>
          </div>

          {wardError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{wardError}</p>
            </div>
          )}

          <div className="mb-6 space-y-4 rounded-lg bg-slate-50 p-4">
            <div>
              <label className="block text-sm font-medium text-slate-900">Ward Name *</label>
              <input
                type="text"
                value={wardFormData.name}
                onChange={(e) => setWardFormData({ ...wardFormData, name: e.target.value })}
                placeholder="Enter ward name (e.g., Emergency, OPD, ICU)"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">Description</label>
              <textarea
                value={wardFormData.description}
                onChange={(e) => setWardFormData({ ...wardFormData, description: e.target.value })}
                placeholder="Enter ward description (optional)"
                rows="2"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddWard}
              disabled={savingWard}
              className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {savingWard ? "Adding Ward..." : "+ Add Ward"}
            </button>
          </div>

          {wardLoading && (
            <div className="text-center text-slate-500">Loading wards...</div>
          )}

          {!wardLoading && wards.length === 0 && !wardError && (
            <div className="text-center text-slate-500">No wards yet. Create one above.</div>
          )}

          {!wardLoading && wards.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Existing Wards</h3>
              {wards.map((ward) => (
                <div key={ward._id || ward.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{ward.name}</p>
                    {ward.description && <p className="text-sm text-slate-600">{ward.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {ward.status || "active"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWard(ward._id || ward.id)}
                      className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Pending Branch Requests</h2>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-slate-500">No pending requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Branch Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">City</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Industry Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{request.branchName || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs">{request.branchCode || "-"}</code>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{request.city || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {request.industryType?.name || request.industryType?.code || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {formatStatusLabel(request.status || "pending")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatCreatedAt(request.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
