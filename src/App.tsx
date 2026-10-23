import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryMedium,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gauge,
  Menu,
  MoreHorizontal,
  Radio,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import {
  advanceSimulation,
  alarms,
  initialTelemetry,
  initialUnit,
} from "./simulation";
import { fetchGprsData, subscribeToGprsData } from "./data/gprs";
import type { Scenario } from "./types";
import {
  Chevron,
  EquipmentMap,
  EquipmentSilhouette,
  HeaderIcon,
  LiveIcon,
  Logo,
  SensorCard,
  SimulationPanel,
  SmallLegend,
  StatusBadge,
  StatusMetric,
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
  const [unit, setUnit] = useState(initialUnit);
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [activeNav, setActiveNav] = useState("overview");
  const [activeTab, setActiveTab] = useState("Live Data");
  const [mobileNav, setMobileNav] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [databaseAlarms, setDatabaseAlarms] = useState(alarms);
  const [databaseStatus, setDatabaseStatus] = useState<"simulation" | "connected" | "error">("simulation");

  useEffect(() => {
    const clockTimer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);
  const applyDatabaseData = (data: Awaited<ReturnType<typeof fetchGprsData>>) => {
    if (!data || data.telemetry.length === 0) return;

    const latest = data.telemetry.at(-1)!;
    setTelemetry(data.telemetry);
    setUnit(current => ({
      ...current,
      sensors: {
        ...current.sensors,
        inlet: { ...current.sensors.inlet, value: latest.inlet, history: data.telemetry.map(point => point.inlet) },
        outlet: { ...current.sensors.outlet, value: latest.outlet, history: data.telemetry.map(point => point.outlet) },
        differential: { ...current.sensors.differential, value: latest.differential, history: data.telemetry.map(point => point.differential) },
        flow: { ...current.sensors.flow, value: latest.flow, history: data.telemetry.map(point => point.flow) },
      },
    }));
    setDatabaseAlarms(data.alarms);
    setDatabaseStatus("connected");
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const data = await fetchGprsData();
        if (!active) return;
        if (data && data.telemetry.length > 0) {
          applyDatabaseData(data);
        } else {
          setDatabaseStatus("simulation");
        }
      } catch {
        if (active) setDatabaseStatus("error");
      }
    };

    void loadData();
    const unsubscribe = subscribeToGprsData(data => {
      if (active) applyDatabaseData(data);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (databaseStatus === "connected") {
      setRunning(false);
      return;
    }

    if (!running) return;
    const timer = window.setInterval(() => {
      const next = advanceSimulation(unit, telemetry, scenario);
      setUnit(next.unit);
      setTelemetry(next.history);
    }, 3000 / speed);
    return () => window.clearInterval(timer);
  }, [databaseStatus, running, speed, scenario, unit, telemetry]);

  const formattedClock = clock.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const statusLabel =
    scenario === "normal" || scenario === "high-load" ? "online" : scenario;
  const kpis = [
    {
      label: "TOTAL UNITS",
      value: "5",
      detail: "Across 5 locations",
      tone: "blue",
    },
    {
      label: "ONLINE",
      value: "5 / 100%",
      detail: "All systems operational",
      tone: "green",
    },
    { label: "ALARMS", value: "3", detail: "Requires attention", tone: "red" },
    { label: "WARNING", value: "2", detail: "Monitor closely", tone: "yellow" },
    {
      label: "AVG. DP",
      value: "1.82",
      unit: "bar",
      detail: "Within normal range",
      tone: "purple",
    },
  ];
  const tabs = ["Live Data", "Status", "Details", "Events", "Maintenance"];
  const selectedMessage =
    activeTab === "Live Data"
      ? null
      : `${activeTab} view is connected to the simulation stream.`;
  const batteryWidth = `${Math.round(unit.battery)}%`;
  const filterWidth = `${Math.round(unit.filterLife)}%`;

  return (
    <div className="app-shell">
      <SamplePage activeNav={activeNav} />
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
              {item === "alarms" && <em>3</em>}
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
        <SimulationPanel
          running={running}
          speed={speed}
          scenario={scenario}
          onRunningChange={setRunning}
          onSpeedChange={setSpeed}
          onScenarioChange={setScenario}
        />
        <div className="sidebar-footer">
          <span>DF REMOTE MONITORING</span>
          <b>v1.0.0 DEMO</b>
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
              <span /> {databaseStatus === "connected" ? "Supabase Connected" : "Simulation Running"}
            </div>
            <div className="header-time">
              <Clock3 size={14} /> {formattedClock}
            </div>
            <HeaderIcon label="Search">
              <Search size={17} />
            </HeaderIcon>
            <HeaderIcon label="Notifications">
              <Bell size={17} />
              <i>3</i>
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
                SYSTEM STATUS <span>•</span> UPDATED JUST NOW
              </p>
              <h2>Fleet performance</h2>
            </div>
            <button className="outline-button">
              <Clock3 size={14} /> Last 24 hours <ChevronDown size={13} />
            </button>
          </div>
          <section className="kpi-grid">
            {kpis.map((kpi) => (
              <article className={`kpi-card ${kpi.tone}`} key={kpi.label}>
                <div className="kpi-top">
                  <span>{kpi.label}</span>
                  <MoreHorizontal size={16} />
                </div>
                <div className="kpi-value">
                  {kpi.value} <small>{kpi.unit}</small>
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
                    SELECTED ASSET <span className="asset-id">DF-RNT-1001</span>
                  </div>
                  <h3>Dual Vessel Cartridge Filter Unit</h3>
                  <p className="muted">
                    <span className="location-dot" /> Rotterdam, NL{" "}
                    <span className="divider" /> Offshore Energy
                  </p>
                </div>
                <div className="header-status">
                  <LiveIcon />
                  <StatusBadge status={unit.status} label={statusLabel} />
                </div>
              </div>
              <div className="equipment-layout">
                <div className="sensor-column">
                  <SensorCard
                    sensor={unit.sensors.inlet}
                    title="Inlet Pressure"
                    sensorKey="inlet"
                  />
                  <SensorCard
                    sensor={unit.sensors.outlet}
                    title="Outlet Pressure"
                    sensorKey="outlet"
                  />
                  <SensorCard
                    sensor={unit.sensors.differential}
                    title="Differential Pressure"
                    sensorKey="differential"
                    accent="#f2b94b"
                  />
                </div>
                <EquipmentSilhouette />
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
                        Pressure trends · Rolling 30 minute window
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
                    <div className="panel-kicker">FLEET OVERVIEW</div>
                    <h3>Equipment locations</h3>
                  </div>
                  <div className="map-toggle">
                    <button className="selected">Map</button>
                    <button>Satellite</button>
                  </div>
                </div>
                <EquipmentMap />
                <div className="location-list">
                  <div>
                    <span className="map-status online" />
                    DF-RNT-1001 <small>Rotterdam, NL</small>
                    <StatusBadge status="online" label="Online" />
                  </div>
                  <div>
                    <span className="map-status online" />
                    DF-RNT-1002 <small>North Sea</small>
                    <StatusBadge status="online" label="Online" />
                  </div>
                  <div>
                    <span className="map-status warning" />
                    DF-RNT-1003 <small>Hamburg, DE</small>
                    <StatusBadge status="warning" label="Warning" />
                  </div>
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
                    <div className="alarm-row" key={alarm.time}>
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
                </div>
              </article>
            </aside>
          </section>
          <section className="status-grid">
            <article className="panel status-card">
              <div className="status-card-head">
                <StatusMetric
                  icon={Gauge}
                  label="FILTER LIFE (ESTIMATED)"
                  tone="#f2b94b"
                >
                  <b>{filterWidth}</b>
                </StatusMetric>
                <span className="status-value warning-text">23 days</span>
              </div>
              <div className="progress">
                <span style={{ width: filterWidth, background: "#e3ab47" }} />
              </div>
              <div className="status-foot">
                <span>Remaining</span>
                <b>148 h operating</b>
              </div>
            </article>
            <article className="panel status-card">
              <StatusMetric
                icon={Activity}
                label="TOTAL OPERATING HOURS"
                tone="#3d91ff"
              >
                <b>
                  {Math.floor(unit.operatingHours)} <small>h</small>
                </b>
              </StatusMetric>
              <div className="status-extra">
                <span>Last reset</span>
                <b>2024-05-01</b>
              </div>
            </article>
            <article className="panel status-card">
              <StatusMetric icon={Radio} label="GPS COORDINATES" tone="#36c899">
                <b className="coordinates">51.9225° N</b>
              </StatusMetric>
              <div className="status-extra">
                <span>Longitude</span>
                <b>
                  4.4792° E <i>±3.2m</i>
                </b>
              </div>
            </article>
            <article className="panel status-card">
              <StatusMetric
                icon={BatteryMedium}
                label="BATTERY STATUS"
                tone="#36c899"
              >
                <b>{batteryWidth}</b>
              </StatusMetric>
              <div className="battery-bar">
                <span style={{ width: batteryWidth }} />
              </div>
              <div className="status-foot">
                <span>Voltage</span>
                <b>12.6 V</b>
              </div>
            </article>
            <article className="panel status-card">
              <StatusMetric icon={Wifi} label="CONNECTIVITY" tone="#36c899">
                <b>4G - Excellent</b>
              </StatusMetric>
              <div className="status-extra">
                <span>Signal strength</span>
                <b>
                  -65 dBm <i className="good">●</i>
                </b>
              </div>
            </article>
          </section>
          <footer>
            <span>
              Dutch Filtration Remote Monitoring Simulation <b>v1.0</b>
            </span>
            <span>
              {databaseStatus === "connected" ? "Supabase GPRS telemetry connected." : databaseStatus === "error" ? "Supabase unavailable; showing simulation data." : "Simulation data active. Add Supabase environment variables to connect."}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
