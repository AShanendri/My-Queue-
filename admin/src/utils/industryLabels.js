export const industryLabels = {
  hospital: {
    customer: "Patient List",
    singularCustomer: "Patient",
    name: "Patient Name",
    phone: "Patient Phone",
    email: "Patient Email",
  },
  saloon: {
    customer: "Client List",
    singularCustomer: "Client",
    name: "Client Name",
    phone: "Client Phone",
    email: "Client Email",
  },
  bank: {
    customer: "Customer List",
    singularCustomer: "Customer",
    name: "Customer Name",
    phone: "Customer Phone",
    email: "Customer Email",
  },
  supermarket: {
    customer: "Customer List",
    singularCustomer: "Customer",
    name: "Customer Name",
    phone: "Customer Phone",
    email: "Customer Email",
  },
  police: {
    customer: "Citizen List",
    singularCustomer: "Citizen",
    name: "Citizen Name",
    phone: "Citizen Phone",
    email: "Citizen Email",
  },
  company: {
    customer: "User List",
    singularCustomer: "User",
    name: "User Name",
    phone: "User Phone",
    email: "User Email",
  },
  default: {
    customer: "Customer List",
    singularCustomer: "Customer",
    name: "Customer Name",
    phone: "Customer Phone",
    email: "Customer Email",
  },
};

export const labelMap = {
  hospital: { unit: 'Wards', staff: 'Doctors', client: 'Patients' },
  bank: { unit: 'Counters', staff: 'Tellers', client: 'Customers' },
  saloon: { unit: 'Styling Chairs', staff: 'Stylists', client: 'Clients' },
  supermarket: { unit: 'Branches', staff: 'Managers', client: 'Customers' },
  police: { unit: 'Divisions', staff: 'Officers', client: 'Citizens' },
  company: { unit: 'Divisions', staff: 'Admins', client: 'Users' },
  default: { unit: 'Branches', staff: 'Admins', client: 'Customers' },
};

export const getIndustryLabels = (industryType) => {
  const key = String(industryType || "").trim().toLowerCase();
  return industryLabels[key] || industryLabels.default;
};
