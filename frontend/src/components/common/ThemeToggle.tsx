import { Moon, Sun, Monitor } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/store'

export default function ThemeToggle() {
  const { theme, setTheme } = useStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-ios-lg"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all ease-ios-spring duration-ios-base dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all ease-ios-spring duration-ios-base dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="cursor-pointer min-h-[44px] px-4"
        >
          <Sun className="mr-3 h-5 w-5" />
          <span className="text-ios-body">Light</span>
          {theme === 'light' && <span className="ml-auto text-ios-blue font-semibold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="cursor-pointer min-h-[44px] px-4"
        >
          <Moon className="mr-3 h-5 w-5" />
          <span className="text-ios-body">Dark</span>
          {theme === 'dark' && <span className="ml-auto text-ios-blue font-semibold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="cursor-pointer min-h-[44px] px-4"
        >
          <Monitor className="mr-3 h-5 w-5" />
          <span className="text-ios-body">System</span>
          {theme === 'system' && <span className="ml-auto text-ios-blue font-semibold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
