import { useState } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import { CLOUD_GPU_PRESETS, LocalGpuConfig, CloudGpuConfig } from '@pokemon-timeline/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cpu, Cloud, Zap, RotateCcw, Plus, Trash2, Sparkles } from 'lucide-react'

interface GpuSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * GPU Settings Modal
 * Configure multiple local and cloud GPUs for batch estimation.
 * Settings are persisted to localStorage via Zustand.
 */
export default function GpuSettingsModal({ isOpen, onClose }: GpuSettingsModalProps) {
  const { toast } = useToast()
  const {
    gpuConfig,
    addLocalGpu,
    updateLocalGpu,
    removeLocalGpu,
    addCloudGpu,
    updateCloudGpu,
    removeCloudGpu,
    setElectricityRate,
    resetGpuConfig,
  } = useStore()

  const [electricityRateInput, setElectricityRateInput] = useState(
    gpuConfig.electricityRateIDR.toString()
  )

  // Local GPU form for adding new
  const [newLocalGpu, setNewLocalGpu] = useState({
    name: '',
    renderTimeMinutes: '',
    powerDrawWatts: '',
  })

  // Cloud GPU form for adding new
  const [newCloudGpu, setNewCloudGpu] = useState({
    name: '',
    renderTimeMinutes: '',
    costPerHourUSD: '',
  })

  const handleAddLocalGpu = () => {
    const renderTime = parseFloat(newLocalGpu.renderTimeMinutes)
    const power = parseFloat(newLocalGpu.powerDrawWatts)

    if (!newLocalGpu.name.trim()) {
      toast({ title: 'Enter GPU name', variant: 'destructive' })
      return
    }
    if (isNaN(renderTime) || renderTime <= 0) {
      toast({ title: 'Invalid render time', variant: 'destructive' })
      return
    }
    if (isNaN(power) || power <= 0) {
      toast({ title: 'Invalid power draw', variant: 'destructive' })
      return
    }

    addLocalGpu({
      name: newLocalGpu.name,
      renderTimeMinutes: renderTime,
      powerDrawWatts: power,
    })

    setNewLocalGpu({ name: '', renderTimeMinutes: '', powerDrawWatts: '' })
    toast({ title: `Added ${newLocalGpu.name}` })
  }

  const handleAddCloudGpu = () => {
    const renderTime = parseFloat(newCloudGpu.renderTimeMinutes)
    const cost = parseFloat(newCloudGpu.costPerHourUSD)

    if (!newCloudGpu.name.trim()) {
      toast({ title: 'Enter GPU name', variant: 'destructive' })
      return
    }
    if (isNaN(renderTime) || renderTime <= 0) {
      toast({ title: 'Invalid render time', variant: 'destructive' })
      return
    }
    if (isNaN(cost) || cost <= 0) {
      toast({ title: 'Invalid cost per hour', variant: 'destructive' })
      return
    }

    addCloudGpu({
      name: newCloudGpu.name,
      renderTimeMinutes: renderTime,
      costPerHourUSD: cost,
    })

    setNewCloudGpu({ name: '', renderTimeMinutes: '', costPerHourUSD: '' })
    toast({ title: `Added ${newCloudGpu.name}` })
  }

  const handleAddPreset = (preset: Omit<CloudGpuConfig, 'id'>) => {
    // Check if already exists
    const exists = gpuConfig.cloudGpus.some(
      (gpu) => gpu.name === preset.name
    )
    if (exists) {
      toast({ title: `${preset.name} already exists`, variant: 'destructive' })
      return
    }
    addCloudGpu(preset)
    toast({ title: `Added ${preset.name} preset` })
  }

  const handleSaveElectricity = () => {
    const rate = parseFloat(electricityRateInput)
    if (isNaN(rate) || rate <= 0) {
      toast({ title: 'Invalid electricity rate', variant: 'destructive' })
      return
    }
    setElectricityRate(rate)
    toast({ title: 'Electricity rate saved' })
  }

  const handleReset = () => {
    resetGpuConfig()
    setElectricityRateInput('1600')
    toast({ title: 'Settings reset to defaults' })
  }

  const handleLocalGpuChange = (
    id: string,
    field: keyof Omit<LocalGpuConfig, 'id'>,
    value: string
  ) => {
    if (field === 'name') {
      updateLocalGpu(id, { name: value })
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        updateLocalGpu(id, { [field]: numValue })
      }
    }
  }

  const handleCloudGpuChange = (
    id: string,
    field: keyof Omit<CloudGpuConfig, 'id'>,
    value: string
  ) => {
    if (field === 'name') {
      updateCloudGpu(id, { name: value })
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        updateCloudGpu(id, { [field]: numValue })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            GPU Settings
          </DialogTitle>
          <DialogDescription>
            Configure your local and cloud GPUs for batch estimations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Local GPUs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Local GPUs</span>
                <span className="text-xs text-text-secondary">
                  ({gpuConfig.localGpus.length})
                </span>
              </div>
            </div>

            {/* Existing Local GPUs */}
            <div className="space-y-2">
              {gpuConfig.localGpus.map((gpu) => (
                <div
                  key={gpu.id}
                  className="flex items-center gap-2 p-3 bg-bg-secondary rounded-lg border border-border"
                >
                  <Input
                    value={gpu.name}
                    onChange={(e) => handleLocalGpuChange(gpu.id, 'name', e.target.value)}
                    className="flex-1"
                    placeholder="GPU Name"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={gpu.renderTimeMinutes}
                      onChange={(e) =>
                        handleLocalGpuChange(gpu.id, 'renderTimeMinutes', e.target.value)
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-text-secondary whitespace-nowrap">min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={gpu.powerDrawWatts}
                      onChange={(e) =>
                        handleLocalGpuChange(gpu.id, 'powerDrawWatts', e.target.value)
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-text-secondary">W</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocalGpu(gpu.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Local GPU */}
            <div className="flex items-center gap-2 p-3 bg-bg-primary rounded-lg border border-dashed border-border">
              <Input
                value={newLocalGpu.name}
                onChange={(e) => setNewLocalGpu({ ...newLocalGpu, name: e.target.value })}
                className="flex-1"
                placeholder="New GPU name"
              />
              <Input
                type="number"
                step="0.1"
                value={newLocalGpu.renderTimeMinutes}
                onChange={(e) =>
                  setNewLocalGpu({ ...newLocalGpu, renderTimeMinutes: e.target.value })
                }
                className="w-20"
                placeholder="min"
              />
              <Input
                type="number"
                value={newLocalGpu.powerDrawWatts}
                onChange={(e) =>
                  setNewLocalGpu({ ...newLocalGpu, powerDrawWatts: e.target.value })
                }
                className="w-20"
                placeholder="W"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLocalGpu}
                className="px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cloud GPUs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Cloud GPUs</span>
                <span className="text-xs text-text-secondary">
                  ({gpuConfig.cloudGpus.length})
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Quick add:
              </span>
              {CLOUD_GPU_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPreset(preset)}
                  className="text-xs h-7"
                >
                  + {preset.name}
                </Button>
              ))}
            </div>

            {/* Existing Cloud GPUs */}
            <div className="space-y-2">
              {gpuConfig.cloudGpus.map((gpu) => (
                <div
                  key={gpu.id}
                  className="flex items-center gap-2 p-3 bg-bg-secondary rounded-lg border border-border"
                >
                  <Input
                    value={gpu.name}
                    onChange={(e) => handleCloudGpuChange(gpu.id, 'name', e.target.value)}
                    className="flex-1"
                    placeholder="GPU Name"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={gpu.renderTimeMinutes}
                      onChange={(e) =>
                        handleCloudGpuChange(gpu.id, 'renderTimeMinutes', e.target.value)
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-text-secondary whitespace-nowrap">min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-secondary">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={gpu.costPerHourUSD}
                      onChange={(e) =>
                        handleCloudGpuChange(gpu.id, 'costPerHourUSD', e.target.value)
                      }
                      className="w-20"
                    />
                    <span className="text-xs text-text-secondary">/hr</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCloudGpu(gpu.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Cloud GPU */}
            <div className="flex items-center gap-2 p-3 bg-bg-primary rounded-lg border border-dashed border-border">
              <Input
                value={newCloudGpu.name}
                onChange={(e) => setNewCloudGpu({ ...newCloudGpu, name: e.target.value })}
                className="flex-1"
                placeholder="New GPU name"
              />
              <Input
                type="number"
                step="0.1"
                value={newCloudGpu.renderTimeMinutes}
                onChange={(e) =>
                  setNewCloudGpu({ ...newCloudGpu, renderTimeMinutes: e.target.value })
                }
                className="w-20"
                placeholder="min"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-secondary">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={newCloudGpu.costPerHourUSD}
                  onChange={(e) =>
                    setNewCloudGpu({ ...newCloudGpu, costPerHourUSD: e.target.value })
                  }
                  className="w-20"
                  placeholder="$/hr"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCloudGpu}
                className="px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Electricity Rate */}
          <div className="space-y-2 p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Electricity Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="elecRate" className="text-xs whitespace-nowrap">
                Rate (Rp/kWh):
              </Label>
              <Input
                id="elecRate"
                type="number"
                value={electricityRateInput}
                onChange={(e) => setElectricityRateInput(e.target.value)}
                className="w-32"
              />
              <Button variant="outline" size="sm" onClick={handleSaveElectricity}>
                Save
              </Button>
            </div>
            <p className="text-xs text-text-secondary">
              PLN electricity rate per kilowatt-hour
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="mr-auto"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset All
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
