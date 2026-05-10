import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { labelMap } from "../../utils/industryLabels";

const dashboardConfig = {
  hospital: {
    title: "Hospital Admin Dashboard",
    subtitle: "Manage hospitals, branches, and healthcare services",
    organizationLabel: labelMap.hospital.unit,
    branchLabel: "Registered Hospitals",
    serviceLabel: "Active Services",
    adminLabel: labelMap.hospital.staff,
    activityLabel: "Recent Hospital Branch Activity",
  },
  police: {
    title: "Police Admin Dashboard",
    subtitle: "Manage stations, divisions, and law enforcement services",
    organizationLabel: labelMap.police.unit,
    branchLabel: "Active Stations",
    serviceLabel: "Active Patrol Services",
    adminLabel: labelMap.police.staff,
    activityLabel: "Recent Station Activity",
  },
  bank: {
    title: "Bank Admin Dashboard",
    subtitle: "Manage bank branches, products, and customer services",
    organizationLabel: labelMap.bank.unit,
    branchLabel: "Open Branches",
    serviceLabel: "Active Banking Services",
    adminLabel: labelMap.bank.staff,
    activityLabel: "Recent Branch Operations",
  },
  supermarket: {
    title: "Retail Admin Dashboard",
    subtitle: "Manage stores, inventory, and retail operations",
    organizationLabel: labelMap.supermarket.unit,
    branchLabel: "Open Stores",
    serviceLabel: "Active Retail Services",
    adminLabel: labelMap.supermarket.staff,
    activityLabel: "Recent Store Activity",
  },
  company: {
    title: "Company Admin Dashboard",
    subtitle: "Manage company units, branches, and organizational operations",
    organizationLabel: labelMap.company.unit,
    branchLabel: "Active Branches",
    serviceLabel: "Active Services",
    adminLabel: labelMap.company.staff,
    activityLabel: "Recent Branch Activity",
  },
  default: {
    title: "Admin Dashboard",
    subtitle: "Manage your organization and services",
    organizationLabel: labelMap.default.unit,
    branchLabel: "Branches",
    serviceLabel: "Services",
    adminLabel: labelMap.default.staff,
    activityLabel: "Recent Activity",
  },
};

const dummyData = {
  hospital: {
    organizations: 3,
    branches: 12,
    services: 18,
    admins: 7,
    activity: [
      { id: "h1", name: "City General - Main", location: "Colombo", status: "active" },
      { id: "h2", name: "Metro Care - Central", location: "Galle", status: "active" },
      { id: "h3", name: "Lakeside - East", location: "Kurunegala", status: "inactive" },
    ],
  },
  police: {
    organizations: 2,
    branches: 10,
    services: 14,
    admins: 8,
    activity: [
      { id: "p1", name: "Colombo Central Station", location: "Colombo", status: "active" },
      { id: "p2", name: "Kandy Division", location: "Kandy", status: "active" },
      { id: "p3", name: "Galle Patrol Unit", location: "Galle", status: "inactive" },
    ],
  },
  bank: {
    organizations: 2,
    branches: 15,
    services: 12,
    admins: 6,
    activity: [
      { id: "b1", name: "City Bank - Main", location: "Colombo", status: "active" },
      { id: "b2", name: "North Bank Branch", location: "Kandy", status: "active" },
      { id: "b3", name: "Garden Finance Center", location: "Galle", status: "inactive" },
    ],
  },
  supermarket: {
    organizations: 2,
    branches: 13,
    services: 11,
    admins: 5,
    activity: [
      { id: "s1", name: "SuperMart City", location: "Colombo", status: "active" },
      { id: "s2", name: "Mart Express Kandy", location: "Kandy", status: "active" },
      { id: "s3", name: "FreshMarket Galle", location: "Galle", status: "inactive" },
    ],
  },
  company: {
    organizations: 4,
    branches: 11,
    services: 13,
    admins: 7,
    activity: [
      { id: "c1", name: "Company HQ - Colombo", location: "Colombo", status: "active" },
      { id: "c2", name: "West Region Branch", location: "Kurunegala", status: "active" },
      { id: "c3", name: "East Region Unit", location: "Galle", status: "inactive" },
    ],
  },
  default: {
    organizations: 2,
    branches: 6,
    services: 8,
    admins: 4,
    activity: [
      { id: "d1", name: "Head Office", location: "Colombo", status: "active" },
      { id: "d2", name: "Regional Center", location: "Kandy", status: "active" },
      { id: "d3", name: "Support Unit", location: "Galle", status: "inactive" },
    ],
  },
};

const formatStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function DynamicAdminDashboard() {
  const { user, role, tenantType, industryType } = useAuth();

  const normalizedIndustryType = useMemo(() => {
    return String(industryType || tenantType || "default").toLowerCase();
  }, [industryType, tenantType]);

  const config = dashboardConfig[normalizedIndustryType] || dashboardConfig.default;
  const data = dummyData[normalizedIndustryType] || dummyData.default;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{config.title}</h1>
          <p className="mt-2 text-gray-600">{config.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.organizationLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.organizations}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.branchLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.branches}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.serviceLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.services}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">{config.adminLabel}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{data.admins}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{config.activityLabel}</h2>
            <div className="mt-4 space-y-3">
              {data.activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {formatStatusLabel(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Identity & Access</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Logged in as</p>
                <p>{user?.email || "Unknown user"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Role</p>
                <p>{role || "Super Admin"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Industry</p>
                <p>{normalizedIndustryType}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Tenant Type</p>
                <p>{tenantType || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
