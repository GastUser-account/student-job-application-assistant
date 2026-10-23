import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardCheck,
  Settings2,
  SlidersHorizontal,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { useState } from "react";

const pageDetails = {
  alarms: {
    eyebrow: "MONITORING / ALARMS",
    title: "Alarm center",
    description: "Review active conditions across the filtration fleet.",
    icon: AlertTriangle,
  },
  analytics: {
    eyebrow: "MONITORING / ANALYTICS",
    title: "Fleet analytics",
    description: "Understand performance trends and operating efficiency.",
    icon: BarChart3,
  },
  settings: {
    eyebrow: "MANAGEMENT / SETTINGS",
    title: "System settings",
    description: "Configure notifications, users, and monitoring preferences.",
    icon: Settings2,
  },
} as const;

const alarmRows = [
  ["10:23:45", "DF-RNT-1003", "Turbidity above threshold", "Medium"],
  ["09:51:12", "DF-RNT-1005", "Differential pressure rising", "High"],
  ["08:14:37", "DF-RNT-1001", "Filter life below 25%", "Medium"],
];

export function SamplePage({ activeNav }: { activeNav: string }) {
  const [warehouseTab, setWarehouseTab] = useState<"cycle" | "storage">("cycle");

  if (activeNav === "overview" || activeNav === "equipment" || activeNav === "map" || activeNav === "maintenance" || activeNav === "reports") {
    return null;
  }

  if (activeNav === "warehouse") {
    return (
      <section className="sample-page">
        <div className="sample-heading">
          <div>
            <span className="section-kicker">OPERATIONS / WAREHOUSE</span>
            <h2>Warehouse</h2>
            <p>
              Track stock levels and keep service materials ready for every
              unit.
            </p>
          </div>
          <div className="sample-heading-icon">
            <WarehouseIcon size={28} />
          </div>
        </div>
        <div className="sample-tabs">
          <button className={warehouseTab === "cycle" ? "active" : ""} onClick={() => setWarehouseTab("cycle")}>Cycle count</button>
          <button className={warehouseTab === "storage" ? "active" : ""} onClick={() => setWarehouseTab("storage")}>Storage</button>
        </div>
        {warehouseTab === "cycle" ? <><div className="sample-grid">
          <article className="sample-card">
            <div className="sample-card-icon">
              <ClipboardCheck size={18} />
            </div>
            <span>Next cycle count</span>
            <strong>Today, 14:30</strong>
            <small>Rotterdam warehouse · 18 items</small>
          </article>
          <article className="sample-card">
            <div className="sample-card-icon">
              <Boxes size={18} />
            </div>
            <span>Items in stock</span>
            <strong>248</strong>
            <small>12 items below reorder level</small>
          </article>
          <article className="sample-card">
            <div className="sample-card-icon">
              <SlidersHorizontal size={18} />
            </div>
            <span>Storage capacity</span>
            <strong>72%</strong>
            <small>1,120 of 1,560 locations used</small>
          </article>
        </div>
        <div className="sample-table">
          <div className="sample-table-title">
            <h3>Cycle count schedule</h3>
            <span>Updated just now</span>
          </div>
          {["Filter cartridges", "Pressure sensors", "Pump seals"].map(
            (item, index) => (
              <div className="sample-table-row" key={item}>
                <strong>{item}</strong>
                <span>
                  {index === 0
                    ? "24 units"
                    : index === 1
                      ? "68 units"
                      : "41 units"}
                </span>
                <b className="sample-status ready">Ready</b>
              </div>
            ),
          )}
        </div></> : <div className="sample-grid">
          <article className="sample-card"><div className="sample-card-icon"><Boxes size={18} /></div><span>Available locations</span><strong>440</strong><small>Across 4 storage zones</small></article>
          <article className="sample-card"><div className="sample-card-icon"><WarehouseIcon size={18} /></div><span>Occupied locations</span><strong>312</strong><small>72% of total capacity</small></article>
          <article className="sample-card"><div className="sample-card-icon"><ClipboardCheck size={18} /></div><span>Reserved for service</span><strong>36</strong><small>Ready for upcoming work orders</small></article>
        </div>}
      </section>
    );
  }

  const page =
    pageDetails[activeNav as keyof typeof pageDetails] ?? pageDetails.analytics;
  const Icon = page.icon;
  return (
    <section className="sample-page">
      <div className="sample-heading">
        <div>
          <span className="section-kicker">{page.eyebrow}</span>
          <h2>{page.title}</h2>
          <p>{page.description}</p>
        </div>
        <div className="sample-heading-icon">
          <Icon size={28} />
        </div>
      </div>
      {activeNav === "alarms" ? (
        <div className="sample-table">
          <div className="sample-table-title">
            <h3>Active alarms</h3>
            <span>3 open events</span>
          </div>
          {alarmRows.map((row) => (
            <div className="sample-table-row alarm-sample-row" key={row[0]}>
              <div>
                <strong>{row[1]}</strong>
                <small>
                  {row[0]} · {row[2]}
                </small>
              </div>
              <b className={`sample-status ${row[3].toLowerCase()}`}>
                {row[3]}
              </b>
            </div>
          ))}
        </div>
      ) : activeNav === "analytics" ? (
        <div className="sample-grid analytics-grid">
          <article className="sample-card">
            <BarChart3 size={20} />
            <span>Fleet availability</span>
            <strong>98.6%</strong>
            <small>+2.4% versus last week</small>
          </article>
          <article className="sample-card">
            <BarChart3 size={20} />
            <span>Average flow</span>
            <strong>12.4 m³/h</strong>
            <small>Stable across 5 locations</small>
          </article>
          <article className="sample-card">
            <BarChart3 size={20} />
            <span>Energy efficiency</span>
            <strong>91.8%</strong>
            <small>Within target range</small>
          </article>
          <div className="analytics-bars">
            <span style={{ height: "44%" }} />
            <span style={{ height: "68%" }} />
            <span style={{ height: "53%" }} />
            <span style={{ height: "82%" }} />
            <span style={{ height: "74%" }} />
            <span style={{ height: "94%" }} />
          </div>
        </div>
      ) : (
        <div className="sample-settings">
          <div>
            <SlidersHorizontal size={19} />
            <div>
              <strong>Notification preferences</strong>
              <small>Receive alarm summaries and service reminders</small>
            </div>
            <i className="toggle on" />
          </div>
          <div>
            <Settings2 size={19} />
            <div>
              <strong>Simulation defaults</strong>
              <small>Normal operation · 1x playback speed</small>
            </div>
            <i className="toggle on" />
          </div>
          <div>
            <ClipboardCheck size={19} />
            <div>
              <strong>Access control</strong>
              <small>Administrator access for DF Internal</small>
            </div>
            <i className="toggle" />
          </div>
        </div>
      )}
    </section>
  );
}
