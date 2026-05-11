import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { labelMap } from "../../utils/industryLabels";
import api from "../../services/api";

const dashboardConfig = {
  hospital: {
    title: "Hospital Admin Dashboard",
    subtitle: "Manage hospitals, branches, and healthcare services",
    organizationLabel: labelMap.hospital.unit,
    branchLabel: "Registered Hospitals",
    wardLabel: "Ward/Department",
    adminLabel: labelMap.hospital.staff,
  },
  police: {
    title: "Police Admin Dashboard",
    subtitle: "Manage stations, divisions, and law enforcement services",
    organizationLabel: labelMap.police.unit,
    branchLabel: "Active Stations",
    wardLabel: "Ward/Section",
    adminLabel: labelMap.police.staff,
  },
  bank: {
    title: "Bank Admin Dashboard",
    subtitle: "Manage bank branches, products, and customer services",
    organizationLabel: labelMap.bank.unit,
    branchLabel: "Open Branches",
    wardLabel: "Ward/Counter",
    adminLabel: labelMap.bank.staff,
  },
  supermarket: {
    title: "Retail Admin Dashboard",
    subtitle: "Manage stores, inventory, and retail operations",
    organizationLabel: labelMap.supermarket.unit,
    branchLabel: "Open Stores",
    wardLabel: "Ward/Counter",
    adminLabel: labelMap.supermarket.staff,
  },
  company: {
    title: "Company Admin Dashboard",
    subtitle: "Manage company units, branches, and organizational operations",
    organizationLabel: labelMap.company.unit,
    branchLabel: "Active Branches",
    wardLabel: "Ward/Counter",
    adminLabel: labelMap.company.staff,
  },
  default: {
    title: "Admin Dashboard",
    subtitle: "Manage your organization and services",
    organizationLabel: labelMap.default.unit,
    branchLabel: "Branches",
    wardLabel: "Wards",
    adminLabel: labelMap.default.staff,
  },
};

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

// Data table component
function DataTable({ title, data, columns, onDelete, onAddNew, loading, error }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onAddNew}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Add New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No items found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-semibold text-gray-900">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id || item._id} className="border-b border-gray-200 hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-600">
                        {col.render ? col.render(item) : item[col.key] || "-"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(item.id || item._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DynamicAdminDashboard() {
  const navigate = useNavigate();
  const { user, role, tenantType, industryType } = useAuth();
  const [industries, setIndustries] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizedIndustryType = useMemo(() => {
    return String(industryType || tenantType || "default").toLowerCase();
  }, [industryType, tenantType]);

  const config = dashboardConfig[normalizedIndustryType] || dashboardConfig.default;

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch industries
        try {
          const indResponse = await api.get("/industry-types");
          setIndustries(Array.isArray(indResponse.data) ? indResponse.data : indResponse.data?.industryTypes || []);
        } catch (err) {
          console.error("Error fetching industries:", err);
          setIndustries([]);
        }

        // Fetch organizations
        try {
          const orgResponse = await api.get(`/organizations?tenantType=${normalizedIndustryType}`);
          setOrganizations(Array.isArray(orgResponse.data) ? orgResponse.data : orgResponse.data?.data || []);
        } catch (err) {
          console.error("Error fetching organizations:", err);
          setOrganizations([]);
        }

        // Fetch branches
        try {
          const branchResponse = await api.get(`/branches?tenantType=${normalizedIndustryType}`);
          setBranches(Array.isArray(branchResponse.data) ? branchResponse.data : branchResponse.data?.data || []);
        } catch (err) {
          console.error("Error fetching branches:", err);
          setBranches([]);
        }

        // Fetch wards
        try {
          const wardResponse = await api.get("/wards");
          setWards(Array.isArray(wardResponse.data) ? wardResponse.data : wardResponse.data?.data || []);
        } catch (err) {
          console.error("Error fetching wards:", err);
          setWards([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [normalizedIndustryType, refreshKey]);

  // Delete handlers
  const handleDeleteIndustry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this industry?")) return;
    try {
      await api.delete(`/industry-types/${id}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setErrors(e => ({ ...e, industry: err.response?.data?.message || "Failed to delete" }));
    }
  };

  const handleDeleteOrganization = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/organizations/${id}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setErrors(e => ({ ...e, organization: err.response?.data?.message || "Failed to delete" }));
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      await api.delete(`/branches/${id}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setErrors(e => ({ ...e, branch: err.response?.data?.message || "Failed to delete" }));
    }
  };

  const handleDeleteWard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ward?")) return;
    try {
      await api.delete(`/wards/${id}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setErrors(e => ({ ...e, ward: err.response?.data?.message || "Failed to delete" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{config.title}</h1>
          <p className="mt-2 text-gray-600">{config.subtitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Industries</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{industries.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.organizationLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{organizations.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.branchLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{branches.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.wardLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{wards.length}</p>
          </div>
        </div>

        {/* Data Tables */}
        <div className="space-y-8">
          <DataTable
            title="Industries"
            data={industries}
            columns={[
              { key: "name", label: "Name" },
              { key: "code", label: "Code" },
              { key: "status", label: "Status", render: (item) => formatStatusLabel(item.status || "active") },
            ]}
            onDelete={handleDeleteIndustry}
            onAddNew={() => navigate("/admin/industry-types")}
            loading={loading}
            error={errors.industry}
          />

          <DataTable
            title={config.organizationLabel}
            data={organizations}
            columns={[
              { key: "organizationName", label: "Name" },
              { key: "address", label: "Location" },
              { key: "status", label: "Status", render: (item) => formatStatusLabel(item.status || "active") },
            ]}
            onDelete={handleDeleteOrganization}
            onAddNew={() => navigate(`/${normalizedIndustryType}-super-admin/organizations`)}
            loading={loading}
            error={errors.organization}
          />

          <DataTable
            title={config.branchLabel}
            data={branches}
            columns={[
              { key: "branchName", label: "Name" },
              { key: "branchCode", label: "Code" },
              { key: "city", label: "Location" },
              { key: "status", label: "Status", render: (item) => formatStatusLabel(item.status || "active") },
            ]}
            onDelete={handleDeleteBranch}
            onAddNew={() => navigate(`/${normalizedIndustryType}-super-admin/branches`)}
            loading={loading}
            error={errors.branch}
          />

          <DataTable
            title={config.wardLabel}
            data={wards}
            columns={[
              { key: "name", label: "Name" },
              { key: "branchCode", label: "Branch" },
              { key: "status", label: "Status", render: (item) => formatStatusLabel(item.status || "active") },
            ]}
            onDelete={handleDeleteWard}
            onAddNew={() => alert("Ward management coming soon")}
            loading={loading}
            error={errors.ward}
          />
        </div>

        {/* User Info */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity & Access</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Logged in as</p>
              <p className="text-gray-600">{user?.email || "Unknown user"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Role</p>
              <p className="text-gray-600">{role || "Super Admin"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Industry Type</p>
              <p className="text-gray-600">{normalizedIndustryType}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Tenant Type</p>
              <p className="text-gray-600">{tenantType || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
