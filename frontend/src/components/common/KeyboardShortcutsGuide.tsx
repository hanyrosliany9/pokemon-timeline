import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface KeyboardShortcutsGuideProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * ★ Insight ─────────────────────────────────────
 * Keyboard shortcuts reference modal shows all
 * available keyboard shortcuts to help users
 * discover keyboard-driven navigation. Accessible
 * via help menu or documentation.
 * ─────────────────────────────────────────────────
 */

const SHORTCUTS = [
  {
    category: 'Timeline',
    shortcuts: [
      { key: 'Ctrl+N', description: 'Create new timeline event' },
    ],
  },
  {
    category: 'Expenses',
    shortcuts: [
      { key: 'Ctrl+E', description: 'Add new expense' },
      { key: 'Ctrl+I', description: 'Add new income' },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { key: 'Escape', description: 'Close dialogs and modals' },
      { key: 'Tab', description: 'Navigate between form fields' },
      { key: 'Enter', description: 'Submit forms' },
    ],
  },
]

export default function KeyboardShortcutsGuide({
  isOpen,
  onClose,
}: KeyboardShortcutsGuideProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Learn keyboard shortcuts to navigate the app faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-lg mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-3 py-1 bg-background border border-border rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              💡 Tips
            </p>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
              <li>Keyboard shortcuts work even while typing in most areas</li>
              <li>Press Escape to close dialogs without submitting</li>
              <li>Use Tab to navigate between form fields</li>
              <li>All buttons and links are keyboard accessible</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
