import { normalizeRole, normalizeTenantType, isSuperAdmin } from "../utils/scopeHelpers.js";

const normalizeRoles = (roles = []) =>
  roles
    .map((role) => normalizeRole(role))
    .filter(Boolean);

export const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const currentRole = normalizeRole(req.user.role);
    if (!currentRole || !normalizedAllowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };
};

export const authorizeIndustry = (...allowedTenantTypes) => {
  const normalizedAllowedTenantTypes = allowedTenantTypes
    .map((value) => normalizeTenantType(value))
    .filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (isSuperAdmin(req.user)) {
      return next();
    }

    const tenantType = normalizeTenantType(req.user.tenantType);
    if (!tenantType || !normalizedAllowedTenantTypes.includes(tenantType)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this industry",
      });
    }

    return next();
  };
};

export const requireTenantType = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const tenantType = normalizeTenantType(req.user.tenantType);
  if (!tenantType) {
    return res.status(403).json({
      success: false,
      message: "Tenant type is required for access",
    });
  }

  return next();
};
