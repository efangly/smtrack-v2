import { z } from 'zod'

import { apiClient } from '@/lib/apiClient'

export const DeviceConfigSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  dhcp: z.boolean().nullable(),
  ip: z.string().nullable(),
  mac: z.string().nullable(),
  subnet: z.string().nullable(),
  gateway: z.string().nullable(),
  dns: z.string().nullable(),
  dhcpEth: z.boolean().nullable(),
  ipEth: z.string().nullable(),
  macEth: z.string().nullable(),
  subnetEth: z.string().nullable(),
  gatewayEth: z.string().nullable(),
  dnsEth: z.string().nullable(),
  ssid: z.string().nullable(),
  password: z.string().nullable(),
  simSP: z.string().nullable(),
  email1: z.string().nullable(),
  email2: z.string().nullable(),
  email3: z.string().nullable(),
  hardReset: z.string().nullable(),
})
export type DeviceConfig = z.infer<typeof DeviceConfigSchema>

export const DeviceConfigInputSchema = z.object({
  dhcp: z.boolean().optional(),
  ip: z.string().optional(),
  mac: z.string().optional(),
  subnet: z.string().optional(),
  gateway: z.string().optional(),
  dns: z.string().optional(),
  dhcpEth: z.boolean().optional(),
  ipEth: z.string().optional(),
  macEth: z.string().optional(),
  subnetEth: z.string().optional(),
  gatewayEth: z.string().optional(),
  dnsEth: z.string().optional(),
  ssid: z.string().optional(),
  password: z.string().optional(),
  simSP: z.string().optional(),
  email1: z.string().optional(),
  email2: z.string().optional(),
  email3: z.string().optional(),
  hardReset: z.string().optional(),
})
export type DeviceConfigInput = z.infer<typeof DeviceConfigInputSchema>

export async function getDeviceConfig(deviceId: string): Promise<DeviceConfig> {
  const { data } = await apiClient.get(
    `/devices/${encodeURIComponent(deviceId)}/config`,
  )
  return DeviceConfigSchema.parse(data)
}

export async function createDeviceConfig(
  deviceId: string,
  dto: DeviceConfigInput,
): Promise<DeviceConfig> {
  const { data } = await apiClient.post(
    `/devices/${encodeURIComponent(deviceId)}/config`,
    dto,
  )
  return DeviceConfigSchema.parse(data)
}

export async function updateDeviceConfig(
  deviceId: string,
  dto: DeviceConfigInput,
): Promise<DeviceConfig> {
  const { data } = await apiClient.put(
    `/devices/${encodeURIComponent(deviceId)}/config`,
    dto,
  )
  return DeviceConfigSchema.parse(data)
}

export async function deleteDeviceConfig(
  deviceId: string,
): Promise<DeviceConfig> {
  const { data } = await apiClient.delete(
    `/devices/${encodeURIComponent(deviceId)}/config`,
  )
  return DeviceConfigSchema.parse(data)
}
