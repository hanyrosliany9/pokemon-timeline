import { StateCreator } from 'zustand'
import { GpuConfig, LocalGpuConfig, CloudGpuConfig } from '@pokemon-timeline/shared'

// Default GPU configuration based on business context
const defaultGpuConfig: GpuConfig = {
  local: {
    enabled: true,
    name: 'RTX 3060 Ti',
    renderTimeMinutes: 14,
    powerDrawWatts: 300,
  },
  cloud: {
    name: 'RTX 5090',
    renderTimeMinutes: 2.5,
    costPerHourUSD: 0.36,
  },
  electricityRateIDR: 1600,
}

export interface GpuConfigSlice {
  gpuConfig: GpuConfig
  setGpuConfig: (config: Partial<GpuConfig>) => void
  setLocalGpu: (config: Partial<LocalGpuConfig>) => void
  setCloudGpu: (config: Partial<CloudGpuConfig>) => void
  setElectricityRate: (rate: number) => void
  resetGpuConfig: () => void
}

export const createGpuConfigSlice: StateCreator<GpuConfigSlice> = (set) => ({
  gpuConfig: defaultGpuConfig,

  setGpuConfig: (config: Partial<GpuConfig>) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        ...config,
      },
    }))
  },

  setLocalGpu: (config: Partial<LocalGpuConfig>) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        local: {
          ...state.gpuConfig.local,
          ...config,
        },
      },
    }))
  },

  setCloudGpu: (config: Partial<CloudGpuConfig>) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        cloud: {
          ...state.gpuConfig.cloud,
          ...config,
        },
      },
    }))
  },

  setElectricityRate: (rate: number) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        electricityRateIDR: rate,
      },
    }))
  },

  resetGpuConfig: () => {
    set({ gpuConfig: defaultGpuConfig })
  },
})
