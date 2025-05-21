
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`, {
      position: "bottom-right",
      duration: 2000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-border bg-background">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet dark:text-urban-blue" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2 text-orange-500" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2 text-urban-blue" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2 text-orange-500 dark:hidden" />
          <Moon className="h-4 w-4 mr-2 text-urban-blue hidden dark:block" />
          Default
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
