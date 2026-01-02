import { useState } from 'react'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
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
import { Switch } from '@/components/ui/switch'
import { Cpu, Cloud, Zap, RotateCcw } from 'lucide-react'

interface GpuSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * GPU Settings Modal
 * Configure local and cloud GPU specs for batch estimation.
 * Settings are persisted to localStorage via Zustand.
 */
export default function GpuSettingsModal({ isOpen, onClose }: GpuSettingsModalProps) {
  const { toast } = useToast()
  const { gpuConfig, setLocalGpu, setCloudGpu, setElectricityRate, resetGpuConfig } = useStore()

  // Local form state
  const [localGpu, setLocalGpuState] = useState({
    enabled: gpuConfig.local.enabled,
    name: gpuConfig.local.name,
    renderTimeMinutes: gpuConfig.local.renderTimeMinutes.toString(),
    powerDrawWatts: gpuConfig.local.powerDrawWatts.toString(),
  })

  const [cloudGpu, setCloudGpuState] = useState({
    name: gpuConfig.cloud.name,
    renderTimeMinutes: gpuConfig.cloud.renderTimeMinutes.toString(),
    costPerHourUSD: gpuConfig.cloud.costPerHourUSD.toString(),
  })

  const [electricityRate, setElectricityRateState] = useState(
    gpuConfig.electricityRateIDR.toString()
  )

  const handleSave = () => {
    // Validate inputs
    const localTime = parseFloat(localGpu.renderTimeMinutes)
    const localPower = parseFloat(localGpu.powerDrawWatts)
    const cloudTime = parseFloat(cloudGpu.renderTimeMinutes)
    const cloudCost = parseFloat(cloudGpu.costPerHourUSD)
    const elecRate = parseFloat(electricityRate)

    if (localGpu.enabled && (isNaN(localTime) || localTime <= 0)) {
      toast({ title: 'Invalid local GPU render time', variant: 'destructive' })
      return
    }
    if (localGpu.enabled && (isNaN(localPower) || localPower <= 0)) {
      toast({ title: 'Invalid local GPU power draw', variant: 'destructive' })
      return
    }
    if (isNaN(cloudTime) || cloudTime <= 0) {
      toast({ title: 'Invalid cloud GPU render time', variant: 'destructive' })
      return
    }
    if (isNaN(cloudCost) || cloudCost <= 0) {
      toast({ title: 'Invalid cloud GPU cost', variant: 'destructive' })
      return
    }
    if (isNaN(elecRate) || elecRate <= 0) {
      toast({ title: 'Invalid electricity rate', variant: 'destructive' })
      return
    }

    // Save to store
    setLocalGpu({
      enabled: localGpu.enabled,
      name: localGpu.name,
      renderTimeMinutes: localTime,
      powerDrawWatts: localPower,
    })

    setCloudGpu({
      name: cloudGpu.name,
      renderTimeMinutes: cloudTime,
      costPerHourUSD: cloudCost,
    })

    setElectricityRate(elecRate)

    toast({ title: 'GPU settings saved!' })
    onClose()
  }

  const handleReset = () => {
    resetGpuConfig()
    // Reset local state to defaults
    setLocalGpuState({
      enabled: true,
      name: 'RTX 3060 Ti',
      renderTimeMinutes: '14',
      powerDrawWatts: '300',
    })
    setCloudGpuState({
      name: 'RTX 5090',
      renderTimeMinutes: '2.5',
      costPerHourUSD: '0.36',
    })
    setElectricityRateState('1600')
    toast({ title: 'Settings reset to defaults' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            GPU Settings
          </DialogTitle>
          <DialogDescription>
            Configure your local and cloud GPU specs for accurate batch estimations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Local GPU Section */}
          <div className="space-y-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Local GPU</span>
              </div>
              <Switch
                checked={localGpu.enabled}
                onCheckedChange={(checked) =>
                  setLocalGpuState({ ...localGpu, enabled: checked })
                }
              />
            </div>

            {localGpu.enabled && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="localName" className="text-xs">GPU Name</Label>
                  <Input
                    id="localName"
                    value={localGpu.name}
                    onChange={(e) => setLocalGpuState({ ...localGpu, name: e.target.value })}
                    placeholder="RTX 3060 Ti"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="localTime" className="text-xs">Render Time (min/card)</Label>
                    <Input
                      id="localTime"
                      type="number"
                      step="0.1"
                      value={localGpu.renderTimeMinutes}
                      onChange={(e) =>
                        setLocalGpuState({ ...localGpu, renderTimeMinutes: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="localPower" className="text-xs">Power Draw (W)</Label>
                    <Input
                      id="localPower"
                      type="number"
                      value={localGpu.powerDrawWatts}
                      onChange={(e) =>
                        setLocalGpuState({ ...localGpu, powerDrawWatts: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cloud GPU Section */}
          <div className="space-y-4 p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Cloud GPU (Vast.ai)</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="cloudName" className="text-xs">GPU Name</Label>
                <Input
                  id="cloudName"
                  value={cloudGpu.name}
                  onChange={(e) => setCloudGpuState({ ...cloudGpu, name: e.target.value })}
                  placeholder="RTX 5090"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cloudTime" className="text-xs">Render Time (min/card)</Label>
                  <Input
                    id="cloudTime"
                    type="number"
                    step="0.1"
                    value={cloudGpu.renderTimeMinutes}
                    onChange={(e) =>
                      setCloudGpuState({ ...cloudGpu, renderTimeMinutes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cloudCost" className="text-xs">Cost ($/hr)</Label>
                  <Input
                    id="cloudCost"
                    type="number"
                    step="0.01"
                    value={cloudGpu.costPerHourUSD}
                    onChange={(e) =>
                      setCloudGpuState({ ...cloudGpu, costPerHourUSD: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Electricity Rate */}
          <div className="space-y-2 p-4 bg-bg-secondary rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Electricity Rate</span>
            </div>
            <div className="space-y-1">
              <Label htmlFor="elecRate" className="text-xs">Rate (Rp/kWh)</Label>
              <Input
                id="elecRate"
                type="number"
                value={electricityRate}
                onChange={(e) => setElectricityRateState(e.target.value)}
                placeholder="1600"
              />
              <p className="text-xs text-text-secondary">PLN electricity rate per kilowatt-hour</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="mr-auto"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
