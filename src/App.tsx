import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Menu,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { fetchGprsData, subscribeToGprsData, type GprsData } from "./data/gprs";
import type { TelemetryPoint } from "./types";
import {
  EquipmentSilhouette,
  HeaderIcon,
  LiveIcon,
  Logo,
  SensorCard,
  SmallLegend,
  StatusBadge,
  TelemetryChart,
  NavIcon,
} from "./components/DashboardParts";
import { SamplePage } from "./components/SamplePages";
import "./styles.css";

const navItems = [
  "overview",
  "equipment",
  "map",
  "alarms",
  "analytics",
  "warehouse",
  "settings",
];
const navLabels: Record<string, string> = {
  overview: "Overview",
  equipment: "Equipment",
  map: "Map",
  alarms: "Alarms",
  analytics: "Analytics",
  warehouse: "Warehouse",
  settings: "Settings",
};

export default function App() {
  const [activeNav, setActiveNav] = useState("overview");
  const [activeTab, setActiveTab] = useState("Live Data");
  const [mobileNav, setMobileNav] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [databaseData, setDatabaseData] = useState<GprsData | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<"connecting" | "connected" | "not-configured" | "error">("connecting");
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    const clockTimer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);
  const applyDatabaseData = (data: GprsData) => {
    setDatabaseData(data);
    setDatabaseError(null);
    setDatabaseStatus("connected");
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const data = await fetchGprsData();
        if (!active) return;
        if (data) {
          applyDatabaseData(data);
        } else {
          setDatabaseStatus("not-configured");
        }
      } catch (error) {
        if (active) {
          setDatabaseStatus("error");
          setDatabaseError(error instanceof Error ? error.message : String(error));
        }
      }
    };

    void loadData();
    const unsubscribe = subscribeToGprsData(
      data => {
        if (active) applyDatabaseData(data);
      },
      error => {
        if (active) {
          setDatabaseStatus("error");
          setDatabaseError(error.message);
        }
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const formattedClock = clock.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const telemetry: TelemetryPoint[] = databaseData?.telemetry ?? [];
  const latest = telemetry.at(-1);
  const databaseAlarms = databaseData?.alarms ?? [];
  const assetId = databaseData?.latestDeviceId ?? "Waiting for device data";
  const assetStatus = databaseStatus === "error" ? "alarm" : latest ? "online" : "warning";
  const statusLabel = databaseStatus === "error" ? "error" : latest ? "receiving data" : "waiting";
  const kpis = [
    {
      label: "DEVICES",
      value: String(databaseData?.devices.length ?? "—"),
      detail: "Seen in Supabase packets",
      tone: "blue",
    },
    {
      label: "PACKETS",
      value: String(databaseData?.packetCount ?? "—"),
      detail: "Stored GPRS records",
      tone: "green",
    },
    {
      label: "ACTIVE ALARMS",
      value: databaseData ? String(databaseAlarms.length) : "—",
      detail: "Reported by backend",
      tone: "red",
    },
    {
      label: "LATEST DP",
      value: latest ? latest.differential.toFixed(2) : "—",
      unit: latest ? "bar" : undefined,
      detail: "Latest device reading",
      tone: "purple",
    },
    {
      label: "LATEST READING",
      value: latest?.time ?? "—",
      detail: databaseData?.latestDeviceId ?? "Waiting for packet data",
      tone: "yellow",
    },
  ];
  const tabs = ["Live Data", "Status", "Details", "Events", "Maintenance"];
  const selectedMessage =
    activeTab === "Live Data"
      ? null
      : `${activeTab} details are not included in the GPRS packet feed.`;
  const connectionLabel = {
    connecting: "Connecting to Supabase",
    connected: "Supabase Connected",
    "not-configured": "Supabase Not Configured",
    error: "Supabase Connection Error",
  }[databaseStatus];

  return (
    <div className="app-shell">
      <SamplePage
        activeNav={activeNav}
        alarms={databaseAlarms}
        databaseStatus={databaseStatus}
      />
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="close-mobile" onClick={() => setMobileNav(false)}>
            ×
          </button>
        </div>
        <div className="nav-section">
          <span className="nav-caption">MONITORING</span>
          {navItems.slice(0, 5).map((item) => (
            <button
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item);
                setMobileNav(false);
              }}
              key={item}
            >
              <NavIcon name={item} />
              <span>{navLabels[item]}</span>
              {item === "alarms" && databaseData && databaseAlarms.length > 0 && <em>{databaseAlarms.length}</em>}
            </button>
          ))}
        </div>
        <div className="nav-section nav-section-lower">
          <span className="nav-caption">MANAGEMENT</span>
          {navItems.slice(5).map((item) => (
            <button
              className={`nav-item ${activeNav === item ? "active" : ""}`}
              onClick={() => {
                setActiveNav(item);
                setMobileNav(false);
              }}
              key={item}
            >
              <NavIcon name={item} />
              <span>{navLabels[item]}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <span>SUPABASE DATA FEED</span>
          <b>{databaseStatus === "connected" ? "CONNECTED" : databaseStatus.toUpperCase()}</b>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="eyebrow">
                DUTCH FILTRATION <span>/</span> REMOTE MONITORING
              </div>
              <h1>Operations Overview</h1>
            </div>
          </div>
          <div className="topbar-right">
            <div className="header-running">
              <span /> {connectionLabel}
            </div>
            <div className="header-time">
              <Clock3 size={14} /> {formattedClock}
            </div>
            <HeaderIcon label="Search">
              <Search size={17} />
            </HeaderIcon>
            <HeaderIcon label="Notifications">
              <Bell size={17} />
              {databaseAlarms.length > 0 && <i>{databaseAlarms.length}</i>}
            </HeaderIcon>
            <div className="profile">
              <div className="avatar">DF</div>
              <div>
                <strong>DF Internal</strong>
                <span>Administrator</span>
              </div>
              <ChevronDown size={13} />
            </div>
          </div>
        </header>
        <div className="dashboard-body">
          <div className="page-toolbar">
            <div>
              <p className="section-kicker">
                SUPABASE DATA FEED <span>•</span> {connectionLabel.toUpperCase()}
              </p>
              <h2>Backend overview</h2>
            </div>
            <span className="outline-button">
              <Clock3 size={14} /> {latest ? `Latest packet · ${latest.time}` : "Waiting for packet data"}
            </span>
          </div>
          <section className="kpi-grid">
            {kpis.map((kpi) => (
              <article className={`kpi-card ${kpi.tone}`} key={kpi.label}>
                <div className="kpi-top">
                  <span>{kpi.label}</span>
                  <MoreHorizontal size={16} />
                </div>
                <div className="kpi-value">
                  {kpi.value} {kpi.unit && <small>{kpi.unit}</small>}
                </div>
                <p>{kpi.detail}</p>
                <div className="kpi-line" />
              </article>
            ))}
          </section>
          <section className="content-grid">
            <article className="panel equipment-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-kicker">
                    LATEST DEVICE <span className="asset-id">{assetId}</span>
                  </div>
                  <h3>GPRS telemetry</h3>
                  <p className="muted">
                    <span className="location-dot" /> {databaseData?.packetCount ?? 0} packets received{" "}
                    <span className="divider" /> {databaseData?.devices.length ?? 0} devices
                  </p>
                </div>
                <div className="header-status">
                  {latest && <LiveIcon />}
                  <StatusBadge status={assetStatus} label={statusLabel} />
                </div>
              </div>
              <div className="equipment-layout">
                <div className="sensor-column">
                  <SensorCard
                    sensor={{ value: latest?.inlet ?? 0, unit: "bar", history: telemetry.map(point => point.inlet) }}
                    title="Inlet Pressure"
                    sensorKey="inlet"
                  />
                  <SensorCard
                    sensor={{ value: latest?.outlet ?? 0, unit: "bar", history: telemetry.map(point => point.outlet) }}
                    title="Outlet Pressure"
                    sensorKey="outlet"
                  />
                  <SensorCard
                    sensor={{ value: latest?.differential ?? 0, unit: "bar", history: telemetry.map(point => point.differential) }}
                    title="Differential Pressure"
                    sensorKey="differential"
                    accent="#f2b94b"
                  />
                </div>
                <EquipmentSilhouette unitId={assetId} />
              </div>
              <div className="tab-row">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? "active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {selectedMessage ? (
                <div className="tab-message">
                  <CheckCircle2 size={18} />
                  {selectedMessage}
                </div>
              ) : (
                <>
                  <div className="chart-header">
                    <div>
                      <h4>Live telemetry</h4>
                      <span>
                        Latest readings · Supabase GPRS packets
                      </span>
                    </div>
                    <div className="chart-legend">
                      <SmallLegend color="#3d91ff">Inlet pressure</SmallLegend>
                      <SmallLegend color="#b978ef">Outlet pressure</SmallLegend>
                      <SmallLegend color="#f5b74f">Diff. pressure</SmallLegend>
                    </div>
                  </div>
                  <TelemetryChart data={telemetry} />
                </>
              )}
            </article>
            <aside className="right-column">
              <article className="panel map-panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">SUPABASE RECORDS</div>
                    <h3>Devices</h3>
                  </div>
                </div>
                <div className="location-list">
                  {databaseData?.devices.length
                    ? databaseData.devices.map(device => (
                      <div key={device}>
                        <span className={`map-status ${device === databaseData.latestDeviceId ? "online" : "warning"}`} />
                        {device}
                        <StatusBadge
                          status={device === databaseData.latestDeviceId ? "online" : "warning"}
                          label={device === databaseData.latestDeviceId ? "Latest" : "Recorded"}
                        />
                      </div>
                    ))
                    : <p>{databaseStatus === "connected" ? "No device packets found." : "Device records will appear after Supabase connects."}</p>}
                </div>
              </article>
              <article className="panel alarm-panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">NEEDS ATTENTION</div>
                    <h3>Active alarms</h3>
                  </div>
                  <button className="text-button">
                    View all <span>→</span>
                  </button>
                </div>
                <div className="alarm-table">
                  <div className="alarm-head">
                    <span>TIME / UNIT</span>
                    <span>SEVERITY</span>
                  </div>
                  {databaseAlarms.map((alarm) => (
                    <div className="alarm-row" key={`${alarm.unit}-${alarm.time}-${alarm.message}`}>
                      <div>
                        <strong>{alarm.time}</strong>
                        <span>{alarm.unit}</span>
                        <p>{alarm.message}</p>
                      </div>
                      <span
                        className={`severity ${alarm.severity.toLowerCase()}`}
                      >
                        <i />
                        {alarm.severity}
                      </span>
                    </div>
                  ))}
                  {databaseData && databaseAlarms.length === 0 && (
                    <p className="empty-alarm-message">No alarms are reported by Supabase.</p>
                  )}
                </div>
              </article>
            </aside>
          </section>
          <footer>
            <span>Dutch Filtration Remote Monitoring</span>
            <span>{databaseStatus === "connected"
              ? latest ? "Live telemetry is loaded from Supabase." : "Connected to Supabase; no telemetry packets found."
              : databaseStatus === "not-configured"
                ? "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Vercel project settings."
                : databaseStatus === "error"
                  ? `Unable to load Supabase data: ${databaseError ?? "unknown error"}`
                  : "Connecting to Supabase…"}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
