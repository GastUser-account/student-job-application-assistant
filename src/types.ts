export type UnitStatus = 'online' | 'warning' | 'alarm'

export type TelemetryPoint = {
  time: string
  inlet: number
  outlet: number
  differential: number
  flow: number
}

export type Sensor = { value: number; unit: string; history: number[] }

export type Alarm = {
  time: string
  unit: string
  severity: 'High' | 'Medium'
  message: string
}

export type EquipmentUnit = {
  id: string
  location: string
  customer: string
  status: UnitStatus
  coordinates: [number, number]
  sensors: {
    inlet: Sensor
    outlet: Sensor
    differential: Sensor
    flow: Sensor
    temperature: Sensor
    turbidity: Sensor
  }
  battery: number
  operatingHours: number
  filterLife: number
}