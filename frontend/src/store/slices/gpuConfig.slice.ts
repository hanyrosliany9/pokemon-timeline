import { StateCreator } from 'zustand'
import { GpuConfig, LocalGpuConfig, CloudGpuConfig } from '@pokemon-timeline/shared'

// Generate unique ID
const generateId = () => crypto.randomUUID()

// Default GPU configuration based on business context
const defaultGpuConfig: GpuConfig = {
  localGpus: [
    {
      id: generateId(),
      name: 'RTX 3060 Ti',
      renderTimeMinutes: 14,
      powerDrawWatts: 300,
    },
  ],
  cloudGpus: [
    {
      id: generateId(),
      name: 'RTX 5090',
      renderTimeMinutes: 2.5,
      costPerHourUSD: 0.36,
    },
  ],
  electricityRateIDR: 1600,
}

export interface GpuConfigSlice {
  gpuConfig: GpuConfig

  // Local GPU CRUD
  addLocalGpu: (gpu: Omit<LocalGpuConfig, 'id'>) => void
  updateLocalGpu: (id: string, updates: Partial<Omit<LocalGpuConfig, 'id'>>) => void
  removeLocalGpu: (id: string) => void

  // Cloud GPU CRUD
  addCloudGpu: (gpu: Omit<CloudGpuConfig, 'id'>) => void
  updateCloudGpu: (id: string, updates: Partial<Omit<CloudGpuConfig, 'id'>>) => void
  removeCloudGpu: (id: string) => void

  // Electricity rate
  setElectricityRate: (rate: number) => void

  // Reset
  resetGpuConfig: () => void
}

export const createGpuConfigSlice: StateCreator<GpuConfigSlice> = (set) => ({
  gpuConfig: defaultGpuConfig,

  // Local GPU CRUD
  addLocalGpu: (gpu) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        localGpus: [
          ...state.gpuConfig.localGpus,
          { ...gpu, id: generateId() },
        ],
      },
    }))
  },

  updateLocalGpu: (id, updates) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        localGpus: state.gpuConfig.localGpus.map((gpu) =>
          gpu.id === id ? { ...gpu, ...updates } : gpu
        ),
      },
    }))
  },

  removeLocalGpu: (id) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        localGpus: state.gpuConfig.localGpus.filter((gpu) => gpu.id !== id),
      },
    }))
  },

  // Cloud GPU CRUD
  addCloudGpu: (gpu) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        cloudGpus: [
          ...state.gpuConfig.cloudGpus,
          { ...gpu, id: generateId() },
        ],
      },
    }))
  },

  updateCloudGpu: (id, updates) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        cloudGpus: state.gpuConfig.cloudGpus.map((gpu) =>
          gpu.id === id ? { ...gpu, ...updates } : gpu
        ),
      },
    }))
  },

  removeCloudGpu: (id) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        cloudGpus: state.gpuConfig.cloudGpus.filter((gpu) => gpu.id !== id),
      },
    }))
  },

  // Electricity rate
  setElectricityRate: (rate) => {
    set((state) => ({
      gpuConfig: {
        ...state.gpuConfig,
        electricityRateIDR: rate,
      },
    }))
  },

  // Reset to defaults
  resetGpuConfig: () => {
    set({
      gpuConfig: {
        localGpus: [
          {
            id: generateId(),
            name: 'RTX 3060 Ti',
            renderTimeMinutes: 14,
            powerDrawWatts: 300,
          },
        ],
        cloudGpus: [
          {
            id: generateId(),
            name: 'RTX 5090',
            renderTimeMinutes: 2.5,
            costPerHourUSD: 0.36,
          },
        ],
        electricityRateIDR: 1600,
      },
    })
  },
})
