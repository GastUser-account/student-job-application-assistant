import type { Alarm, EquipmentUnit, Scenario, TelemetryPoint } from './types'

const seed = (value: number, amount: number) => Array.from({ length: 18 }, (_, index) => value + Math.sin(index * 0.8) * amount)

export const initialUnit: EquipmentUnit = {
  id: 'DF-RNT-1001', location: 'Rotterdam, NL', customer: 'Offshore Energy', status: 'online', coordinates: [51.9225, 4.4792], battery: 95, operatingHours: 142, filterLife: 65,
  sensors: {
    inlet: { value: 8.35, unit: 'bar', history: seed(8.35, 0.15) }, outlet: { value: 5.25, unit: 'bar', history: seed(5.25, 0.1) }, differential: { value: 3.1, unit: 'bar', history: seed(3.1, 0.09) }, flow: { value: 12.4, unit: 'm³/h', history: seed(12.4, 0.45) }, temperature: { value: 28.7, unit: '°C', history: seed(28.7, 0.4) }, turbidity: { value: 1.23, unit: 'NTU', history: seed(1.23, 0.08) },
  },
}

export const initialTelemetry: TelemetryPoint[] = Array.from({ length: 28 }, (_, index) => ({
  time: `${String(9 + Math.floor(index / 6)).padStart(2, '0')}:${String((index * 10) % 60).padStart(2, '0')}`,
  inlet: 8.15 + Math.sin(index * 0.45) * 0.28,
  outlet: 5.05 + Math.sin(index * 0.42) * 0.18,
  differential: 3.1 + Math.sin(index * 0.5) * 0.12,
  flow: 12.2 + Math.sin(index * 0.38) * 0.6,
}))

export const scenarioSettings: Record<Scenario, { label: string; pressure: number; flow: number; turbidity: number; status: EquipmentUnit['status'] }> = {
  normal: { label: 'Normal Operation', pressure: 0, flow: 0, turbidity: 0, status: 'online' },
  'high-load': { label: 'High Load', pressure: 0.35, flow: 2.2, turbidity: 0.2, status: 'online' },
  warning: { label: 'Warning Condition', pressure: 0.55, flow: -1.2, turbidity: 2.8, status: 'warning' },
  alarm: { label: 'Alarm Condition', pressure: 1.15, flow: -2.4, turbidity: 4.6, status: 'alarm' },
}

export function advanceSimulation(unit: EquipmentUnit, history: TelemetryPoint[], scenario: Scenario): { unit: EquipmentUnit; history: TelemetryPoint[] } {
  const setting = scenarioSettings[scenario]
  const jitter = (amount: number) => (Math.random() - 0.5) * amount
  const inlet = Math.max(0, 8.35 + setting.pressure + jitter(0.12))
  const outlet = Math.max(0, 5.25 + jitter(0.1))
  const differential = Math.max(0, inlet - outlet)
  const flow = Math.max(0, 12.4 + setting.flow + jitter(0.35))
  const temperature = 28.7 + jitter(0.3)
  const turbidity = Math.max(0, 1.23 + setting.turbidity + jitter(0.16))
  const now = new Date()
  const point = { time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), inlet, outlet, differential, flow }
  const updateSensor = (value: number, current: number[]) => ({ value, unit: '', history: [...current.slice(-17), value] })
  const updated: EquipmentUnit = { ...unit, status: setting.status, battery: Math.max(0, unit.battery - 0.01), operatingHours: unit.operatingHours + 0.001, filterLife: Math.max(0, unit.filterLife - 0.002), sensors: { ...unit.sensors, inlet: { ...updateSensor(inlet, unit.sensors.inlet.history), unit: 'bar' }, outlet: { ...updateSensor(outlet, unit.sensors.outlet.history), unit: 'bar' }, differential: { ...updateSensor(differential, unit.sensors.differential.history), unit: 'bar' }, flow: { ...updateSensor(flow, unit.sensors.flow.history), unit: 'm³/h' }, temperature: { ...updateSensor(temperature, unit.sensors.temperature.history), unit: '°C' }, turbidity: { ...updateSensor(turbidity, unit.sensors.turbidity.history), unit: 'NTU' } } }
  return { unit: updated, history: [...history.slice(-27), point] }
}

export const alarms: Alarm[] = [
  { time: '10:24:10', unit: 'DF-RNT-1005', severity: 'High', message: 'Differential pressure high (4.25 bar)' },
  { time: '10:23:45', unit: 'DF-RNT-1003', severity: 'Medium', message: 'Turbidity above threshold (5.12 NTU)' },
  { time: '10:22:31', unit: 'DF-RNT-1001', severity: 'Medium', message: 'Filter life 85% used' },
]