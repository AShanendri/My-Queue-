import { useEffect, useState } from "react";
import {
  createIndustryType,
  deleteIndustryType,
  getIndustryTypes,
} from "../../services/industryTypeService";

export default function IndustryTypes() {
  const [industryTypes, setIndustryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    unitLabel: "",
    staffLabel: "",
    clientLabel: "",
    status: "active",
  });

  const loadIndustryTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getIndustryTypes();
      setIndustryTypes(response.industryTypes || []);
    } catch (err) {
      setError(err?.message || "Unable to load industry types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustryTypes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: String(formData.name || "").trim(),
        code: String(formData.code || "").trim().toLowerCase(),
        description: String(formData.description || "").trim(),
        unitLabel: String(formData.unitLabel || "").trim(),
        staffLabel: String(formData.staffLabel || "").trim(),
        clientLabel: String(formData.clientLabel || "").trim(),
        status: String(formData.status || "active").trim().toLowerCase(),
      };

      if (!payload.name || !payload.code || !payload.unitLabel || !payload.staffLabel || !payload.clientLabel) {
        setError("Name, code, and all three labels are required.");
        return;
      }

      const response = await createIndustryType(payload);
      if (response.success) {
        setFormData({ name: "", code: "", description: "", unitLabel: "", staffLabel: "", clientLabel: "", status: "active" });
        await loadIndustryTypes();
      } else {
        setError(response.message || "Unable to create industry type.");
      }
    } catch (err) {
      setError(err?.message || "Unable to create industry type.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (industryTypeId) => {
    const confirmed = window.confirm("Delete this industry type? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await deleteIndustryType(industryTypeId);
      if (response.success) {
        await loadIndustryTypes();
      } else {
        setError(response.message || "Unable to delete industry type.");
      }
    } catch (err) {
      setError(err?.message || "Unable to delete industry type.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Industry Types</h1>
        <p className="mt-2 text-sm text-slate-500">Manage tenant industry types used by branches and organization setup.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Existing Industry Types</h2>
              <p className="text-sm text-slate-500">Review active and inactive industry types.</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">Loading industry types...</div>
          ) : industryTypes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No industry types found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Name</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Code</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Status</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {industryTypes.map((industryType) => (
                    <tr key={industryType.id || industryType._id}>
                      <td className="border-b border-slate-200 px-4 py-3">{industryType.name || "—"}</td>
                      <td className="border-b border-slate-200 px-4 py-3">{industryType.code || "—"}</td>
                      <td className="border-b border-slate-200 px-4 py-3 capitalize">{industryType.status || "—"}</td>
                      <td className="border-b border-slate-200 px-4 py-3">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleDelete(industryType.id || industryType._id)}
                          className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Create Industry Type</h2>
            <p className="text-sm text-slate-500">Add a new dynamic industry type for branch and tenant setup.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="e.g. Hospital"
                required
              />
            </div>

            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
                Code <span className="text-red-600">*</span>
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="e.g. hospital"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="Optional description for this industry type"
              />
            </div>

            <div>
              <label htmlFor="unitLabel" className="mb-2 block text-sm font-medium text-slate-700">
                Unit Label <span className="text-red-600">*</span>
              </label>
              <input
                id="unitLabel"
                name="unitLabel"
                type="text"
                value={formData.unitLabel}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="e.g. Counters, Wards"
                required
              />
            </div>

            <div>
              <label htmlFor="staffLabel" className="mb-2 block text-sm font-medium text-slate-700">
                Staff Label <span className="text-red-600">*</span>
              </label>
              <input
                id="staffLabel"
                name="staffLabel"
                type="text"
                value={formData.staffLabel}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="e.g. Tellers, Doctors"
                required
              />
            </div>

            <div>
              <label htmlFor="clientLabel" className="mb-2 block text-sm font-medium text-slate-700">
                Client Label <span className="text-red-600">*</span>
              </label>
              <input
                id="clientLabel"
                name="clientLabel"
                type="text"
                value={formData.clientLabel}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
                placeholder="e.g. Customers, Patients"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-sky-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Create Industry Type"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
