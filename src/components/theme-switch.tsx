import { useEffect } from "react";
import { useTheme } from "@/context/theme-provider";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export function ThemeSwitch() {
  const { theme } = useTheme();

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);

  return (
    <div className="flex justify-center">
      <AnimatedThemeToggler
        className="text-muted-foreground hover:bg-accent hover:text-foreground"
        shape="circle"
      />
    </div>
  );
}
