import { useState } from 'react'
import CategoryManagement from '@/components/settings/CategoryManagement'
import GpuSettingsModal from '@/components/settings/GpuSettingsModal'
import { Button } from '@/components/ui/button'
import { Cpu } from 'lucide-react'
import { useStore } from '@/store/store'

export default function SettingsPage() {
  const [showGpuSettings, setShowGpuSettings] = useState(false)
  const { gpuConfig } = useStore()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* GPU Settings Card */}
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">GPU Configuration</h3>
              <p className="text-sm text-text-secondary">
                Configure GPU specs for batch cost estimation
              </p>
            </div>
          </div>
          <Button onClick={() => setShowGpuSettings(true)} variant="outline">
            Configure
          </Button>
        </div>
        {/* Current GPU Summary */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Local GPUs:</span>{' '}
            <span className="text-text-primary font-medium">
              {gpuConfig.localGpus.length > 0
                ? gpuConfig.localGpus.map((g) => g.name).join(', ')
                : 'None configured'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Cloud GPUs:</span>{' '}
            <span className="text-text-primary font-medium">
              {gpuConfig.cloudGpus.length > 0
                ? gpuConfig.cloudGpus.map((g) => g.name).join(', ')
                : 'None configured'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <CategoryManagement />

      <GpuSettingsModal
        isOpen={showGpuSettings}
        onClose={() => setShowGpuSettings(false)}
      />
    </div>
  )
}
