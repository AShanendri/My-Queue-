import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getIndustryLabels } from "../../utils/industryLabels";

export default function BranchAdminUsers() {
  const { industryType, tenantType } = useAuth();
  const normalizedIndustryType = useMemo(
    () => String(industryType || tenantType || "").trim().toLowerCase(),
    [industryType, tenantType]
  );

  const labels = useMemo(
    () => getIndustryLabels(normalizedIndustryType),
    [normalizedIndustryType]
  );

  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ error: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setStatus({ error: "", message: "" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setStatus({ error: "All fields are required.", message: "" });
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    setUsers((current) => [newUser, ...current]);
    setFormData({ name: "", phone: "", email: "" });
    setStatus({ error: "", message: `${labels.singularCustomer} added successfully.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{labels.customer}</h1>
        <p className="mt-2 text-sm text-slate-500">Manage {labels.customer.toLowerCase()} for this branch.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Add {labels.singularCustomer}</h2>
          <p className="mt-1 text-sm text-slate-500">Collect basic contact details for the branch {labels.singularCustomer.toLowerCase()}.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                {labels.name}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder={`Enter ${labels.singularCustomer} name`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                {labels.phone}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={`Enter ${labels.singularCustomer} phone`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                {labels.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={`Enter ${labels.singularCustomer} email`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {status.error && <p className="text-sm text-red-600">{status.error}</p>}
            {status.message && <p className="text-sm text-emerald-600">{status.message}</p>}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Add {labels.singularCustomer}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{labels.customer}</h2>
          {users.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No {labels.singularCustomer.toLowerCase()}s have been added yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-600">{user.phone}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
