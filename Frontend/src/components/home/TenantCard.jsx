import { useNavigate } from "react-router-dom";
import { Grid } from "lucide-react";
import { tenantConfig } from "../../configs/tenantConfig";

export default function TenantCard({ title, description, routeKey, entryPath, onEnter, icon: Icon }) {
  const navigate = useNavigate();
  const tenant = tenantConfig[routeKey];
  const theme = tenant?.theme;
  const targetPath = entryPath || (routeKey ? `/${routeKey}/select-organization` : undefined);
  const CardIcon = Icon || Grid;

  const handleClick = () => {
    if (onEnter) {
      onEnter();
      return;
    }

    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex-1">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
              theme?.light || "bg-slate-100"
            } ${theme?.text || "text-slate-700"}`}
          >
            <CardIcon className="h-6 w-6" />
          </div>

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              theme?.soft || "bg-slate-100"
            } ${theme?.text || "text-slate-700"}`}
          >
            {tenant?.shortName || title || "Industry"}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="mt-auto pt-6">
        <button
          className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
            theme?.button || "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Enter
        </button>
      </div>
    </div>
  );
}