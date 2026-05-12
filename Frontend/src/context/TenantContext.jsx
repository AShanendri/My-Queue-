import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { tenantConfig } from "../configs/tenantConfig.js";
import { legacyStorageKeys, readJSON, readValue, removeItem, storageKeys, writeJSON, writeValue } from "../utils/storage";

/* eslint-disable react-hooks/set-state-in-effect */

// eslint-disable-next-line react-refresh/only-export-components
export const TenantContext = createContext();

export const TenantProvider = ({ tenantType, children }) => {
  const tenant = useMemo(() => tenantConfig[tenantType], [tenantType]);
  const theme = tenant?.theme;

  const selectedOrganizationIdKey = useMemo(() => `queueflow_${tenantType}_selectedOrganization_id`, [tenantType]);

  const readSelectedIndustryTypeId = useCallback(() => {
    const savedCode = String(localStorage.getItem("queueflow_selectedIndustryCode") || "").trim().toLowerCase();
    const tt = String(tenantType || "").trim().toLowerCase();
    if (!savedCode || !tt || savedCode !== tt) {
      return "";
    }
    return String(localStorage.getItem("queueflow_selectedIndustryTypeId") || "").trim();
  }, [tenantType]);

  const readSelectedOrganization = useCallback(() =>
    readValue(localStorage, storageKeys.selectedOrganization(tenantType), [legacyStorageKeys.selectedOrganization]) || "", [tenantType]);

  const readSelectedOrganizationId = useCallback(() => localStorage.getItem(selectedOrganizationIdKey) || "", [selectedOrganizationIdKey]);

  const readSelectedBranch = useCallback(() => {
    const savedTenant = readValue(localStorage, storageKeys.selectedTenant(tenantType), [legacyStorageKeys.selectedTenant]);
    const savedBranchObject = readJSON(localStorage, storageKeys.selectedBranch(tenantType), [], null);

    if (savedBranchObject && typeof savedBranchObject === "object" && (!savedTenant || savedTenant === tenantType)) {
      return savedBranchObject;
    }

    const savedBranch = readValue(localStorage, storageKeys.selectedBranch(tenantType), [legacyStorageKeys.selectedBranch]);

    if (savedBranch && (!savedTenant || savedTenant === tenantType)) {
      return {
        id: "",
        branchName: savedBranch,
      };
    }

    return null;
  }, [tenantType]);

  const readSelectedService = useCallback(() => {
    const savedTenant = readValue(localStorage, storageKeys.selectedTenant(tenantType), [legacyStorageKeys.selectedTenant]);
    const savedServiceObject = readJSON(localStorage, storageKeys.selectedService(tenantType), [], null);

    if (savedServiceObject && typeof savedServiceObject === "object" && (!savedTenant || savedTenant === tenantType)) {
      return savedServiceObject;
    }

    const savedService = readValue(localStorage, storageKeys.selectedService(tenantType), [legacyStorageKeys.selectedService]);

    if (savedService && (!savedTenant || savedTenant === tenantType)) {
      return {
        id: "",
        serviceName: savedService,
      };
    }

    return null;
  }, [tenantType]);

  const [selectedBranch, setSelectedBranchState] = useState(() => readSelectedBranch());
  const [selectedService, setSelectedServiceState] = useState(() => readSelectedService());
  const [selectedOrganization, setSelectedOrganizationState] = useState(() => readSelectedOrganization());
  const [selectedOrganizationId, setSelectedOrganizationIdState] = useState(() => readSelectedOrganizationId());
  const [selectedIndustryTypeId, setSelectedIndustryTypeIdState] = useState(() => readSelectedIndustryTypeId());

  // Update state when tenantType changes
  useEffect(() => {
    const newBranch = readSelectedBranch();
    const newService = readSelectedService();
    const newOrganization = readSelectedOrganization();
    const newOrganizationId = readSelectedOrganizationId();
    const newIndustryTypeId = readSelectedIndustryTypeId();

    setSelectedBranchState(newBranch);
    setSelectedServiceState(newService);
    setSelectedOrganizationState(newOrganization);
    setSelectedOrganizationIdState(newOrganizationId);
    setSelectedIndustryTypeIdState(newIndustryTypeId);
  }, [tenantType, readSelectedBranch, readSelectedService, readSelectedOrganization, readSelectedOrganizationId, readSelectedIndustryTypeId]);

  const setSelectedOrganization = useCallback((organizationName, organizationId = "") => {
    const normalizedName = String(organizationName || "").trim();
    const normalizedId = String(organizationId || "").trim();

    const pathParts = window.location.pathname.split('/');
    const tenantFromUrl = pathParts[1];


    const activeTenant = tenantType || tenantFromUrl;

    if (!activeTenant || activeTenant === "undefined") {
      console.error("TenantType is missing! Cannot save organization.");
      return;
    }

    setSelectedOrganizationState(normalizedName);
    setSelectedOrganizationIdState(normalizedId);


    const orgNameKey = `queueflow_${activeTenant}_selectedOrganization`;
    const orgIdKey = `${orgNameKey}_id`;

    localStorage.setItem(orgNameKey, normalizedName);
    localStorage.setItem(orgIdKey, normalizedId);
    localStorage.setItem(`queueflow_selectedTenant`, activeTenant);
  }, [tenantType]);

  const setSelectedIndustry = useCallback((industryTypeId, industryCode) => {
    const id = String(industryTypeId || "").trim();
    const code = String(industryCode || "").trim().toLowerCase();
    setSelectedIndustryTypeIdState(id);
    if (id) {
      localStorage.setItem("queueflow_selectedIndustryTypeId", id);
    } else {
      localStorage.removeItem("queueflow_selectedIndustryTypeId");
    }
    if (code) {
      localStorage.setItem("queueflow_selectedIndustryCode", code);
    } else {
      localStorage.removeItem("queueflow_selectedIndustryCode");
    }
  }, []);

  const setSelectedBranch = useCallback((branch) => {
    setSelectedBranchState(branch);

    if (branch) {
      writeJSON(localStorage, storageKeys.selectedBranch(tenantType), branch);
    } else {
      removeItem(localStorage, storageKeys.selectedBranch(tenantType));
    }

    writeValue(localStorage, storageKeys.selectedTenant(tenantType), tenantType);
  }, [tenantType]);

  const setSelectedService = useCallback((service) => {
    setSelectedServiceState(service);

    if (service) {
      writeJSON(localStorage, storageKeys.selectedService(tenantType), service);
    } else {
      removeItem(localStorage, storageKeys.selectedService(tenantType));
    }

    writeValue(localStorage, storageKeys.selectedTenant(tenantType), tenantType);
  }, [tenantType]);

  const clearSelection = useCallback(() => {
    setSelectedBranchState(null);
    setSelectedServiceState(null);
    setSelectedOrganizationState("");
    setSelectedOrganizationIdState("");
    removeItem(localStorage, storageKeys.selectedTenant(tenantType));
    removeItem(localStorage, storageKeys.selectedOrganization(tenantType));
    removeItem(localStorage, selectedOrganizationIdKey);
    removeItem(localStorage, storageKeys.selectedBranch(tenantType));
    removeItem(localStorage, storageKeys.selectedService(tenantType));
    removeItem(localStorage, legacyStorageKeys.selectedOrganization);
    removeItem(localStorage, legacyStorageKeys.selectedBranch);
    removeItem(localStorage, legacyStorageKeys.selectedService);
    removeItem(localStorage, "queueflow_selectedIndustryTypeId");
    removeItem(localStorage, "queueflow_selectedIndustryCode");
    setSelectedIndustryTypeIdState("");
  }, [tenantType, selectedOrganizationIdKey]);

  const value = useMemo(
    () => ({
      tenantType,
      tenant,
      theme,
      selectedOrganization,
      selectedOrganizationId,
      selectedIndustryTypeId,
      selectedBranch,
      selectedService,
      setSelectedOrganization,
      setSelectedIndustry,
      setSelectedBranch,
      setSelectedService,
      clearSelection,
    }),
    [
      tenantType,
      tenant,
      theme,
      selectedOrganization,
      selectedOrganizationId,
      selectedIndustryTypeId,
      selectedBranch,
      selectedService,
      setSelectedOrganization,
      setSelectedIndustry,
      setSelectedBranch,
      setSelectedService,
      clearSelection,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTenant = () => useContext(TenantContext);