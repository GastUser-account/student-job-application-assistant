import { memo, useMemo } from 'react'
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts'
import { Activity, AlertTriangle, BatteryMedium, Bell, ChevronDown, CircleGauge, Clock3, Droplets, Gauge, MapPin, Radio, Settings2, Thermometer, Warehouse, Waves, Wifi, type LucideIcon } from 'lucide-react'
import type { EquipmentUnit, Scenario, TelemetryPoint } from '../types'
import { scenarioSettings } from '../simulation'

const iconMap = { inlet: Gauge, outlet: Gauge, differential: Activity, flow: Waves, temperature: Thermometer, turbidity: Droplets }
type SensorKey = keyof EquipmentUnit['sensors']

export function Logo() {
  return <div className="brand"><div className="brand-mark"><span /><span /><span /></div><div><strong>DUTCH</strong><b>FILTRATION</b></div></div>
}

export function StatusBadge({ status, label }: { status: EquipmentUnit['status']; label?: string }) {
  return <span className={`status-badge ${status}`}><i />{label ?? status}</span>
}

export const Sparkline = memo(function Sparkline({ values, color = '#3d91ff' }: { values: number[]; color?: string }) {
  const data = useMemo(() => values.map((value, index) => ({ index, value })), [values])
  return <div className="sparkline"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
})

export const SensorCard = memo(function SensorCard({ sensor, title, sensorKey, accent }: { sensor: EquipmentUnit['sensors'][SensorKey]; title: string; sensorKey: SensorKey; accent?: string }) {
  const Icon = iconMap[sensorKey]
  return <div className="sensor-card"><div className="sensor-heading"><span><Icon size={13} />{title}</span><span className="sensor-dot" style={{ background: accent ?? '#42a5ff' }} /></div><div className="sensor-value">{sensor.value.toFixed(sensorKey === 'turbidity' ? 2 : 2)} <small>{sensor.unit}</small></div><Sparkline values={sensor.history} color={accent} /></div>
})

export function EquipmentSilhouette() {
  return <div className="equipment-stage"><div className="equipment-glow" /><div className="vessel vessel-left"><div className="vessel-top" /><div className="vessel-body"><span /><span /><span /></div><div className="vessel-foot" /></div><div className="vessel vessel-right"><div className="vessel-top" /><div className="vessel-body"><span /><span /><span /></div><div className="vessel-foot" /></div><div className="pipe pipe-top" /><div className="pipe pipe-middle" /><div className="pipe pipe-bottom" /><div className="valve valve-one" /><div className="valve valve-two" /><div className="equipment-label">DF-RNT-1001</div></div>
}

export function TelemetryChart({ data }: { data: TelemetryPoint[] }) {
  const latest = data.at(-1);
  const channels = [
    { key: "inlet", label: "Inlet pressure", color: "#3d91ff" },
    { key: "outlet", label: "Outlet pressure", color: "#b978ef" },
    { key: "differential", label: "Differential pressure", color: "#f2b94b" },
  ] as const;

  return (
    <div className="telemetry-display">
      <div className="telemetry-readings">
        {channels.map((channel) => (
          <article
            className={`telemetry-reading ${channel.key}`}
            key={channel.key}
          >
            <div className="telemetry-reading-heading">
              <span>{channel.label}</span>
              <i />
            </div>
            <strong>
              {latest ? latest[channel.key].toFixed(2) : "—"}
              <small>bar</small>
            </strong>
            <Sparkline
              values={data.map((point) => point[channel.key])}
              color={channel.color}
            />
            <span className="telemetry-reading-time">
              {latest ? `Latest · ${latest.time}` : "Waiting for readings"}
            </span>
          </article>
        ))}
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 12, left: -14, bottom: 0 }}
          >
            <defs>
              <linearGradient id="inletFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#368bff" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#368bff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#263747"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#000000", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={36}
            />
            <YAxis
              tick={{ fill: "#000000", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 14]}
            />
            <Tooltip
              contentStyle={{
                background: "#111e2c",
                border: "1px solid #304355",
                borderRadius: 6,
                fontSize: 11,
              }}
              labelStyle={{ color: "#a6b6c6" }}
            />
            <Area
              type="monotone"
              dataKey="inlet"
              name="Inlet Pressure"
              stroke="#3d91ff"
              fill="url(#inletFill)"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="outlet"
              name="Outlet Pressure"
              stroke="#b978ef"
              fill="none"
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="differential"
              name="Differential Pressure"
              stroke="#f2b94b"
              fill="none"
              strokeWidth={1.6}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EquipmentMap() {
  const markers = [{ id: '1001', city: 'Rotterdam', x: '53%', y: '39%', status: 'online' }, { id: '1002', city: 'North Sea', x: '45%', y: '19%', status: 'online' }, { id: '1003', city: 'Hamburg', x: '67%', y: '23%', status: 'warning' }, { id: '1004', city: 'Le Havre', x: '37%', y: '63%', status: 'online' }, { id: '1005', city: 'Algeciras', x: '24%', y: '86%', status: 'alarm' }]
  return <div className="map-area"><div className="map-grid" /><div className="land land-a" /><div className="land land-b" /><div className="land land-c" />{markers.map(marker => <div className="map-marker" key={marker.id} style={{ left: marker.x, top: marker.y }} title={`DF-RNT-${marker.id} · ${marker.city}`}><span className={marker.status} /><label>{marker.id}</label></div>)}<div className="map-scale">100 km</div><div className="map-zoom"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div></div>
}

export function NavIcon({ name }: { name: string }) {
  const icons: Record<string, LucideIcon> = { overview: CircleGauge, equipment: Activity, map: MapPin, alarms: AlertTriangle, analytics: Activity, warehouse: Warehouse, settings: Settings2 }
  const Icon = icons[name] ?? Activity
  return <Icon size={16} strokeWidth={1.8} />
}

export function StatusMetric({ icon: Icon, label, children, tone }: { icon: typeof Activity; label: string; children: React.ReactNode; tone?: string }) {
  return <div className="status-metric"><div className="metric-icon" style={{ color: tone }}><Icon size={16} /></div><div><span>{label}</span><strong>{children}</strong></div></div>
}

export function SimulationPanel({ running, speed, scenario, onRunningChange, onSpeedChange, onScenarioChange }: { running: boolean; speed: number; scenario: Scenario; onRunningChange: (value: boolean) => void; onSpeedChange: (value: number) => void; onScenarioChange: (value: Scenario) => void }) {
  return <div className="simulation-panel"><div className="sim-title"><span className="pulse-dot" />SIMULATION CONTROLS</div><div className="sim-row"><span>State</span><button className="sim-state" onClick={() => onRunningChange(!running)}><i className={running ? 'running' : ''} />{running ? 'Running' : 'Paused'}</button></div><label className="control-label" htmlFor="speed">Speed <select id="speed" value={speed} onChange={event => onSpeedChange(Number(event.target.value))}>{[1, 2, 5, 10].map(value => <option value={value} key={value}>{value}x</option>)}</select></label><label className="control-label" htmlFor="scenario">Scenario <select id="scenario" value={scenario} onChange={event => onScenarioChange(event.target.value as Scenario)}>{Object.entries(scenarioSettings).map(([value, setting]) => <option value={value} key={value}>{setting.label}</option>)}</select></label><button className="stop-button" onClick={() => onRunningChange(false)}><span>■</span> Stop Simulation</button></div>
}

export const HeaderIcon = ({ children, label }: { children: React.ReactNode; label: string }) => <button className="header-icon" aria-label={label}>{children}</button>
export const SmallLegend = ({ color, children }: { color: string; children: React.ReactNode }) => <span className="legend-item"><i style={{ background: color }} />{children}</span>
export const LiveIcon = () => <div className="live-indicator"><span />LIVE</div>
export const MiniConnectivity = () => <><Wifi size={14} /><span>4G</span></>
export const HeaderExtras = () => <><Clock3 size={15} /><Bell size={17} /><BatteryMedium size={15} /><Radio size={15} /></>
export const Chevron = () => <ChevronDown size={14} />