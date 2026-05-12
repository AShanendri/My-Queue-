import { normalizeRole, normalizeTenantType } from "../utils/scopeHelpers.js";

/**
 * Get redirect URL based on user role and tenantType
 * Determines where to send the user after login
 */
export const getRedirectUrl = (user) => {
  if (!user || !user.role) {
    return "/login";
  }

  const role = normalizeRole(user.role);
  const tenantType = normalizeTenantType(user.tenantType);

  // Super admin - goes to main admin dashboard
  if (role === "super_admin") {
    return "/admin-dashboard";
  }

  // Police super admin
  if (role === "police_super_admin") {
    return "/admin/dashboard";
  }

  // Hospital super admin
  if (role === "hospital_super_admin") {
    return "/admin/dashboard";
  }

  // Company super admin (manages bank and supermarket)
  if (role === "company_super_admin") {
    return "/admin/dashboard";
  }

  // Organization admin - tenant-scoped branch management
  if (role === "organization_admin") {
    if (tenantType === "police") {
      return "/police-admin/branches";
    } else if (tenantType === "hospital") {
      return "/hospital-admin/branches";
    } else if (tenantType === "bank") {
      return "/bank-admin/branches";
    } else if (tenantType === "supermarket") {
      return "/supermarket-admin/branches";
    }
    return "/admin/branches";
  }

  // Branch admin - branch-level management
  if (role === "branch_admin") {
    if (tenantType === "police") {
      return "/police-branch/dashboard";
    } else if (tenantType === "hospital") {
      return "/hospital-branch/dashboard";
    } else if (tenantType === "bank") {
      return "/bank-branch/dashboard";
    } else if (tenantType === "supermarket") {
      return "/supermarket-branch/dashboard";
    }
    return "/branch/dashboard";
  }

  // Staff - staff dashboard
  if (role === "staff") {
    if (tenantType === "police") {
      return "/police-staff/dashboard";
    } else if (tenantType === "hospital") {
      return "/hospital-staff/dashboard";
    } else if (tenantType === "bank") {
      return "/bank-staff/dashboard";
    } else if (tenantType === "supermarket") {
      return "/supermarket-staff/dashboard";
    }
    return "/staff/dashboard";
  }

  // Default fallback
  return "/dashboard";
};

/**
 * Get redirect info endpoint
 * Frontend can call this after login to determine where to redirect
 */
export const getRedirectInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const redirectUrl = getRedirectUrl(req.user);

    return res.status(200).json({
      success: true,
      redirectUrl,
      user: {
        id: req.user.id,
        role: req.user.role,
        tenantType: req.user.tenantType,
        organizationId: req.user.organizationId,
      },
    });
  } catch (error) {
    console.error("getRedirectInfo error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while determining redirect",
      error: error?.message || error,
    });
  }
};
