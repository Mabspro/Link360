import type { PoolUpdate } from "@/lib/types";

/** PoolUpdate from DB may have kind as string */
type PoolUpdateRow = Omit<PoolUpdate, "kind"> & { kind: string };
import { Megaphone, Loader2, Ship, MapPin, Info } from "lucide-react";

const kindConfig: Record<
  string,
  { label: string; icon: typeof Info; color: string }
> = {
  update: { label: "Update", icon: Info, color: "text-gray-600 bg-gray-100" },
  announcement: { label: "Announcement", icon: Megaphone, color: "text-blue-700 bg-blue-100" },
  loading: { label: "Loading", icon: Loader2, color: "text-amber-700 bg-amber-100" },
  shipped: { label: "Shipped", icon: Ship, color: "text-indigo-700 bg-indigo-100" },
  arrived_port: { label: "At Port", icon: MapPin, color: "text-cyan-700 bg-cyan-100" },
  arrived_destination: { label: "In Zambia", icon: MapPin, color: "text-emerald-700 bg-emerald-100" },
  cleared: { label: "Cleared Customs", icon: Info, color: "text-teal-700 bg-teal-100" },
  ready_pickup: { label: "Ready for Pickup", icon: Info, color: "text-green-700 bg-green-100" },
  tracking: { label: "Tracking", icon: MapPin, color: "text-purple-700 bg-purple-100" },
};

interface PoolTrackingUpdatesProps {
  updates: PoolUpdateRow[] | PoolUpdate[];
  poolTitle?: string;
}

export function PoolTrackingUpdates({ updates }: PoolTrackingUpdatesProps) {
  return (
    <div className="card p-6">
      <h2 className="heading-3 mb-4">Tracking & updates</h2>
      {updates.length === 0 ? (
        <p className="text-sm text-gray-500">
          Updates and shipping announcements will appear here once the container is announced or in transit.
        </p>
      ) : (
        <ul className="space-y-4">
          {updates.map((u) => {
            const config = kindConfig[u.kind] ?? kindConfig.update;
            const Icon = config.icon;
            return (
              <li key={u.id} className="border-l-2 border-gray-200 pl-4 py-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </span>
                {u.title && <p className="font-medium text-gray-900 mt-1">{u.title}</p>}
                {u.body && <p className="text-sm text-gray-600 mt-0.5">{u.body}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(u.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
