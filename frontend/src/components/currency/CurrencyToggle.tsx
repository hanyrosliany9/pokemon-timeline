import { useStore } from '@/store/store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'

export default function CurrencyToggle() {
  const { preferredCurrency, setPreferredCurrency, exchangeRate } = useStore()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
        <DollarSign size={16} />
        <span>1 USDT = {parseFloat(exchangeRate).toLocaleString()} IDR</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant={preferredCurrency === 'USDT' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreferredCurrency('USDT')}
          className="relative overflow-hidden"
        >
          <motion.span
            key={preferredCurrency === 'USDT' ? 'usdt-active' : 'usdt-inactive'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            $ USDT
          </motion.span>
        </Button>
        <Button
          variant={preferredCurrency === 'IDR' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreferredCurrency('IDR')}
          className="relative overflow-hidden"
        >
          <motion.span
            key={preferredCurrency === 'IDR' ? 'idr-active' : 'idr-inactive'}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            Rp IDR
          </motion.span>
        </Button>
      </div>
    </div>
  )
}
