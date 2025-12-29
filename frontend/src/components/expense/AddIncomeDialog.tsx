import { useState } from 'react'
import { Currency } from '@pokemon-timeline/shared'
import { useToast } from '@/hooks/use-toast'
import incomeService from '@/services/income.service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface AddIncomeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddIncomeDialog({ isOpen, onClose }: AddIncomeDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: Currency.USDT,
    incomeDate: new Date().toISOString().split('T')[0],
    notes: '',
    tags: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCurrencyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currency: value as Currency,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim() || !formData.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in description and amount',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const incomeData = {
        description: formData.description,
        amount: formData.amount,
        currency: formData.currency,
        incomeDate: formData.incomeDate,
        notes: formData.notes || undefined,
        tags: tags.length > 0 ? tags : [],
      }

      await incomeService.create(incomeData)

      toast({
        title: 'Success',
        description: `Income added: ${formData.description}`,
      })

      // Reset form
      setFormData({
        description: '',
        amount: '',
        currency: Currency.USDT,
        incomeDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: '',
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add income',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Record a new income source. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Card sale payment"
              required
            />
          </div>

          {/* Currency & Amount Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency" className="text-text-primary">
                  <SelectValue className="text-text-primary" />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border">
                  <SelectItem value="USDT" className="text-text-primary">USDT</SelectItem>
                  <SelectItem value="IDR" className="text-text-primary">IDR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="incomeDate">Date *</Label>
            <Input
              id="incomeDate"
              name="incomeDate"
              type="date"
              value={formData.incomeDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this income"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., sale, pokemon, bulk"
            />
          </div>

          {/* Dialog Footer with Actions */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-ios-green hover:bg-ios-green/90 text-white" disabled={loading}>
              {loading ? 'Adding...' : 'Add Income'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
