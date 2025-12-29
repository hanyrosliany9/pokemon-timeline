import { useState } from 'react'
import { Currency } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'
import expenseService from '@/services/expense.service'
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
import { CategoryIcon } from '@/lib/category-icons'

interface AddExpenseDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddExpenseDialog({ isOpen, onClose }: AddExpenseDialogProps) {
  const { toast } = useToast()
  const { categories } = useStore()
  const [loading, setLoading] = useState(false)

  // Get first category ID as default
  const defaultCategoryId = categories.length > 0 ? categories[0].id : ''

  const [formData, setFormData] = useState({
    description: '',
    categoryId: defaultCategoryId,
    amount: '',
    currency: 'USDT' as Currency,
    expenseDate: new Date().toISOString().split('T')[0],
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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
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

      if (!formData.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a category',
          variant: 'destructive',
        })
        return
      }

      const expenseData = {
        description: formData.description,
        categoryId: formData.categoryId,
        amount: formData.amount,
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        notes: formData.notes || undefined,
        tags: tags.length > 0 ? tags : [],
      }

      await expenseService.create(expenseData)

      toast({
        title: 'Success',
        description: `Expense added: ${formData.description}`,
      })

      // Reset form
      const newDefaultCategoryId = categories.length > 0 ? categories[0].id : ''
      setFormData({
        description: '',
        categoryId: newDefaultCategoryId,
        amount: '',
        currency: 'USDT',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: '',
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add expense',
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
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Create a new expense record. All fields marked with * are required.
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
              placeholder="e.g., Card cropping supplies"
              className="text-text-primary placeholder:text-text-secondary"
              required
            />
          </div>

          {/* Category & Currency Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category" className="text-text-primary">
                  <div className="flex items-center gap-2 text-text-primary">
                    {formData.categoryId && categories.find(c => c.id === formData.categoryId) && (
                      <CategoryIcon category={categories.find(c => c.id === formData.categoryId)!} />
                    )}
                    <SelectValue className="text-text-primary" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-text-primary">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={category} />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-2 gap-4">
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
                className="text-text-primary placeholder:text-text-secondary"
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Date *</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={handleInputChange}
                className="text-text-primary placeholder:text-text-secondary"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes about this expense"
              className="text-text-primary placeholder:text-text-secondary"
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
              placeholder="e.g., urgent, pokemon, cropping"
              className="text-text-primary placeholder:text-text-secondary"
            />
          </div>

          {/* Dialog Footer with Actions */}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
