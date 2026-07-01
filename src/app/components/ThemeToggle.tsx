import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

// Botón para alternar entre modo claro y oscuro.
// Reutilizable: colócalo en cualquier página. Recuerda la elección del usuario.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={
        "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
        "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 " +
        "dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700 " +
        className
      }
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}
