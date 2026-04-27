import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPage,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/material-ui-dropdown-menu"

export function ModeToggle() {
  const [theme, setThemeState] = React.useState<
    "theme-light" | "dark" | "system"
  >("theme-light")

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setThemeState(isDarkMode ? "dark" : "theme-light")
  }, [])

  React.useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="translate-y-1 md:translate-y-0" asChild>
        <Button variant="secondary" className="mr-4 h-8" size="sm">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-5 min-w-[12rem] w-auto" align="end">
        <DropdownMenuPage id="main">
          <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setThemeState(v as any)}>
            <DropdownMenuRadioItem value="theme-light" className="flex justify-center items-center gap-3 py-2 pr-8 hover:bg-white/10">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <span>Claro</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className="flex justify-center items-center gap-3 py-2 pr-8 hover:bg-white/10">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span>Oscuro</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className="flex justify-center items-center gap-3 py-2 pr-8 hover:bg-white/10">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span>Sistema</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuPage>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}