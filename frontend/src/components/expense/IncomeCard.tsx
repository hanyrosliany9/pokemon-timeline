import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import { Income } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import incomeService from '@/services/income.service'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Edit2 } from 'lucide-react'

interface IncomeCardProps {
  income: Income
  onEdit: (income: Income) => void
}

function IncomeCard({ income, onEdit }: IncomeCardProps) {
  const { preferredCurrency, deleteIncome } = useStore()
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = new Date(income.incomeDate).toLocaleDateString()
  const amount = preferredCurrency === 'USDT' ? income.amountUSDT : income.amountIDR
  const symbol = preferredCurrency === 'USDT' ? '$' : 'Rp'

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await incomeService.delete(income.id)
      deleteIncome(income.id)
      toast({
        title: 'Success',
        description: `Income deleted: ${income.description}`,
      })
      setShowDeleteConfirm(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete income',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Card className="hover:shadow-md transition-all border-green-100">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Income Badge */}
              <div className="flex-shrink-0">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Income</Badge>
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-2 mb-2">
                  <h4 className="font-semibold text-text-primary truncate">{income.description}</h4>
                  <Badge variant="outline" className="w-fit">
                    {preferredCurrency}
                  </Badge>
                </div>

                <p className="text-sm text-text-secondary mb-2">{date}</p>

                {income.notes && <p className="text-sm text-text-secondary mb-2 line-clamp-2">{income.notes}</p>}

                {income.tags && income.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {income.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount and Action Section */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 sm:gap-2 flex-shrink-0">
                <p className="text-2xl font-bold text-green-600 tabular-nums">
                  {symbol} {parseFloat(amount.toString()).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(income)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    aria-label="Edit income"
                    title="Edit income"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label="Delete income"
                    title="Delete income"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Income?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{income.description}"? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={deleting}>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(IncomeCard, (prevProps, nextProps) => {
  return prevProps.income.id === nextProps.income.id
})
