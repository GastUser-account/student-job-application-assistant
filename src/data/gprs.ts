import type { Alarm, TelemetryPoint } from '../types'
import { supabase } from '../lib/supabase'

type PacketRow = {
  packet_type: 'STA' | 'STB' | 'STH'
  device_id: string
  device_time: string
  payload: string
  alarm_label: string | null
}

export type GprsData = {
  telemetry: TelemetryPoint[]
  alarms: Alarm[]
  latest: Record<string, number>
  packetCount: number
  devices: string[]
  latestDeviceId: string | null
}

const numberValue = (value: string | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parsePayload = (payload: string) => {
  const body = payload.replace(/^#/, '').replace(/(?:[0-9A-F]{2})#?$/, '')
  return Object.fromEntries(body.split(';').flatMap(part => {
    const [key, value] = part.split(':')
    return key && value !== undefined ? [[key, value]] : []
  }))
}

const formatTime = (deviceTime: string, offset = 0) => {
  const time = deviceTime.slice(-4)
  const hour = Number(time.slice(0, 2))
  const minute = Number(time.slice(2)) + offset
  return `${String(hour + Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}

const toTelemetry = (row: PacketRow): TelemetryPoint[] => {
  const fields = parsePayload(row.payload)
  const samples = row.packet_type === 'STB' ? Math.max(1, fields.A00?.split('|').length ?? 1) : 1
  return Array.from({ length: samples }, (_, index) => {
    const value = (key: string) => numberValue(fields[key]?.split('|')[index])
    const inlet = value('A00')
    const outlet = value('A05')
    return {
      time: formatTime(row.device_time, row.packet_type === 'STB' ? index : 0),
      inlet,
      outlet,
      differential: Math.abs(inlet - outlet),
      flow: value('A03'),
    }
  }).filter(point => point.inlet !== 0 || point.outlet !== 0 || point.flow !== 0)
}

const toAlarm = (row: PacketRow): Alarm | null => {
  if (!row.alarm_label) return null
  return {
    time: formatTime(row.device_time),
    unit: row.device_id,
    severity: row.alarm_label.toLowerCase().includes('high') || row.alarm_label.toLowerCase().includes('close') ? 'High' : 'Medium',
    message: row.alarm_label,
  }
}

export async function fetchGprsData(): Promise<GprsData | null> {
  if (!supabase) return null
  const { data, error, count } = await supabase
    .from('gprs_packets')
    .select('packet_type, device_id, device_time, payload, alarm_label', { count: 'exact' })
    .order('device_time', { ascending: false })
    .limit(1000)
  if (error) throw error

  const rows = ((data ?? []) as PacketRow[]).reverse()
  const latestDeviceId = rows.at(-1)?.device_id ?? null
  const devices = [...new Set(rows.map(row => row.device_id))]
  const telemetry = rows
    .filter(row => row.device_id === latestDeviceId)
    .flatMap(toTelemetry)
    .slice(-28)
  const latest: Record<string, number> = telemetry.length > 0
    ? {
        inlet: telemetry.at(-1)?.inlet ?? 0,
        outlet: telemetry.at(-1)?.outlet ?? 0,
        differential: telemetry.at(-1)?.differential ?? 0,
        flow: telemetry.at(-1)?.flow ?? 0,
      }
    : {}

  return {
    telemetry,
    alarms: rows.map(toAlarm).filter((alarm): alarm is Alarm => alarm !== null).reverse(),
    latest,
    packetCount: count ?? rows.length,
    devices,
    latestDeviceId,
  }
}

export function subscribeToGprsData(
  onData: (data: GprsData) => void,
  onError: (error: Error) => void,
): () => void {
  if (!supabase) return () => {}

  const channel = supabase
    .channel('gprs_packets_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gprs_packets' }, async () => {
      try {
        const next = await fetchGprsData()
        if (next) onData(next)
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    })
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onError(error ?? new Error(`Supabase realtime subscription ${status.toLowerCase()}`))
      }
    })

  return () => {
    if (supabase) {
      supabase.removeChannel(channel)
    }
  }
}
