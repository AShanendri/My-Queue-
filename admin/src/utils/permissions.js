import { CANONICAL_ROLES, normalizeRole } from "../context/AuthContext";
import { labelMap } from "./industryLabels";

// Role hierarchy and capabilities
export const roleHierarchy = {
  [CANONICAL_ROLES.POLICE_SUPER_ADMIN]: {
    label: "Police Super Admin",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]: {
    label: "Hospital Super Admin",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.COMPANY_SUPER_ADMIN]: {
    label: "Company Super Admin",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: true,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: true,
    canViewReports: true,
  },
  [CANONICAL_ROLES.ORGANIZATION_ADMIN]: {
    label: "Organization Admin",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: false,
    canManageBranches: true,
    canCreateBranchAdmins: true,
    canCreateOrgAdmins: false,
    canViewReports: true,
  },
  [CANONICAL_ROLES.BRANCH_ADMIN]: {
    label: "Branch Admin",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: false,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: false,
    canViewReports: false,
  },
  [CANONICAL_ROLES.STAFF]: {
    label: "Staff",
    dashboardPath: "/admin/dashboard",
    canManageOrganizations: false,
    canManageBranches: false,
    canCreateBranchAdmins: false,
    canCreateOrgAdmins: false,
    canViewReports: false,
  },
};

// Route-level access control
const routeRoleMap = {
  "/police-super-admin": [CANONICAL_ROLES.POLICE_SUPER_ADMIN],
  "/hospital-super-admin": [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN],
  "/company-super-admin": [CANONICAL_ROLES.COMPANY_SUPER_ADMIN],
  "/organization-admin": [CANONICAL_ROLES.ORGANIZATION_ADMIN],
  "/branch-admin": [CANONICAL_ROLES.BRANCH_ADMIN],
  "/staff": [CANONICAL_ROLES.STAFF],
};

export const isSuperAdmin = (role) => 
  role === CANONICAL_ROLES.POLICE_SUPER_ADMIN ||
  role === CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN ||
  role === CANONICAL_ROLES.COMPANY_SUPER_ADMIN;

export const isOrgAdmin = (role) => role === CANONICAL_ROLES.ORGANIZATION_ADMIN;

export const isBranchAdmin = (role) => role === CANONICAL_ROLES.BRANCH_ADMIN;

export const isStaff = (role) => role === CANONICAL_ROLES.STAFF;

export const canAccessRoute = (role, path) => {
  if (!role || !path) {
    return false;
  }

  const matchedPrefix = Object.keys(routeRoleMap).find((prefix) => path.startsWith(prefix));
  if (!matchedPrefix) {
    return true;
  }

  return routeRoleMap[matchedPrefix].includes(role);
};

export const getDefaultDashboardPath = (role) => {
  const normalizedRole = normalizeRole(role);
  const config = roleHierarchy[normalizedRole];
  if (config) {
    return config.dashboardPath;
  }
  return "/login";
};

export const getRoleLabel = (role) => {
  const config = roleHierarchy[role];
  return config ? config.label : "Unknown Role";
};

export const hasCapability = (role, capability) => {
  const config = roleHierarchy[role];
  return config ? config[capability] : false;
};

export const getRoleSidebarLinks = (role, tenantType) => {
  const normalizedRole = normalizeRole(role);
  const labels = labelMap[tenantType] || labelMap.default;

  const links = {
    [CANONICAL_ROLES.HOSPITAL_SUPER_ADMIN]: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Industry Types", to: "/admin/industry-types" },
    ],
    [CANONICAL_ROLES.POLICE_SUPER_ADMIN]: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Industry Types", to: "/admin/industry-types" },
    ],
    [CANONICAL_ROLES.COMPANY_SUPER_ADMIN]: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Industry Types", to: "/admin/industry-types" },
    ],
    [CANONICAL_ROLES.ORGANIZATION_ADMIN]: [
      { label: "Dashboard", to: "/admin/dashboard" },
    ],
    [CANONICAL_ROLES.BRANCH_ADMIN]: [
      { label: "Dashboard", to: "/branch-admin/dashboard" },
      { label: "Users", to: "/branch-admin/users" },
      { label: `Manage ${labels.staff}`, to: "/branch-admin/staff" },
      { label: "Operations", to: "/branch-admin/operations" },
      { label: "Branch Details", to: "/branch-admin/branch-details" },
    ],
    [CANONICAL_ROLES.STAFF]: [
      { label: "Dashboard", to: "/staff/dashboard" },
      { label: "Profile", to: "/staff/profile" },
      { label: "Tasks", to: "/staff/tasks" },
    ],
  };

  return links[normalizedRole] || [];
};

export const getSidebarLinksByRole = (role) => {
  // For backward compatibility, but now we need tenantType
  // This will be updated in AdminLayout
  return getRoleSidebarLinks(role, 'default');
};
