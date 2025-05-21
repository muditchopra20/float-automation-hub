
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
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`, {
      position: "bottom-right",
      duration: 2000,
    });
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9 rounded-full border-border bg-background/80">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-9 h-9 rounded-full border-border bg-background/80 backdrop-blur-sm transition-all hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet dark:text-urban-blue" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl dark:shadow-black/20 backdrop-blur-sm"
      >
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer dark:hover:bg-gray-700"
        >
          <Sun className="h-4 w-4 mr-2 text-orange-500" />
          <span className="dark:text-gray-200">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer dark:hover:bg-gray-700"
        >
          <Moon className="h-4 w-4 mr-2 text-urban-blue" />
          <span className="dark:text-gray-200">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer dark:hover:bg-gray-700"
        >
          <div className="h-4 w-4 mr-2 relative">
            <Sun className="h-4 w-4 absolute text-orange-500 dark:hidden" />
            <Moon className="h-4 w-4 absolute text-urban-blue hidden dark:block" />
          </div>
          <span className="dark:text-gray-200">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
