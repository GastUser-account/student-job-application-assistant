import type { Alarm } from "../types";

type SamplePageProps = {
  activeNav: string;
  alarms: Alarm[];
  databaseStatus: "connecting" | "connected" | "not-configured" | "error";
};

const pageTitles: Record<string, string> = {
  alarms: "Alarm center",
  analytics: "Analytics",
  warehouse: "Warehouse",
  settings: "Settings",
};

export function SamplePage({ activeNav, alarms, databaseStatus }: SamplePageProps) {
  if (activeNav === "overview" || activeNav === "equipment" || activeNav === "map") {
    return null;
  }

  if (activeNav === "alarms") {
    return (
      <section className="sample-page">
        <div className="sample-heading">
          <div>
            <span className="section-kicker">MONITORING / ALARMS</span>
            <h2>Alarm center</h2>
            <p>Alarm records reported by the Supabase GPRS packet feed.</p>
          </div>
        </div>
        <div className="sample-table">
          <div className="sample-table-title">
            <h3>Active alarms</h3>
            <span>{alarms.length} reported</span>
          </div>
          {alarms.map((alarm) => (
            <div className="sample-table-row alarm-sample-row" key={`${alarm.unit}-${alarm.time}-${alarm.message}`}>
              <div>
                <strong>{alarm.unit}</strong>
                <small>{alarm.time} · {alarm.message}</small>
              </div>
              <b className={`sample-status ${alarm.severity.toLowerCase()}`}>
                {alarm.severity}
              </b>
            </div>
          ))}
          {alarms.length === 0 && (
            <div className="sample-table-row">
              <span>{databaseStatus === "connected"
                ? "No alarms are reported by Supabase."
                : "Alarm data will appear after Supabase connects."}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }

  const title = pageTitles[activeNav] ?? "Dashboard";
  return (
    <section className="sample-page">
      <div className="sample-heading">
        <div>
          <span className="section-kicker">SUPABASE DATA</span>
          <h2>{title}</h2>
          <p>
            This section is not available from the current GPRS packet schema.
            No sample values are shown.
          </p>
        </div>
      </div>
    </section>
  );
}
