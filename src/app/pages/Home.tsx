import { Link, useNavigate } from "react-router";
import { Mic, Video, TrendingUp, Sparkles, Zap, Target } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { ThemeToggle } from "../components/ThemeToggle";


export function Home() {
  // ── CAMBIO 2: navigate + verificación de sesión ──────────────
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      // getSession() lee la sesión local (rápido, sin colgarse en la red).
      // Aun así lo limitamos con un timeout por si acaso, para que el botón
      // SIEMPRE navegue y nunca quede "muerto".
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2500)
      );
      const result = await Promise.race([
        supabase.auth.getSession(),
        timeout,
      ]);

      const user = result?.data?.session?.user ?? null;
      navigate(user ? "/onboarding" : "/login");
    } catch (error) {
      // Si Supabase falla (claves inválidas, sin conexión, etc.) no dejamos
      // el botón "muerto": llevamos al login de todas formas.
      console.error("No se pudo verificar la sesión:", error);
      navigate("/login");
    }
  };
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]" />

      <header className="relative p-6 z-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <img
            src="/logo-seo.png"
            alt="SEO"
            className="h-10 w-auto dark:invert-0 invert"
          />
        </h1>
        <ThemeToggle />
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 z-10">
        <div className="max-w-5xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                Potenciado por Inteligencia Artificial
              </span>
            </div>

            <h2 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Domina el Arte de la{" "}
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Comunicación
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Practica y perfecciona tus habilidades de oratoria con retroalimentación
              inteligente en tiempo real. Desde defensa de tesis hasta presentaciones de
              ventas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Análisis Visual</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Detectamos contacto visual, gestos, postura y expresiones faciales en tiempo
                real
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:border-cyan-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Análisis de Voz</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Identificamos muletillas, tono, velocidad, volumen y claridad en tu discurso
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6 rounded-xl hover:border-emerald-500/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                Progreso Continuo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Seguimiento de tu evolución con reportes detallados y recomendaciones
                personalizadas
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-blue-500/50"
            >
              <Zap className="w-5 h-5" />
              Comenzar Ahora
              <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <Target className="w-5 h-5" />
              Ver Dashboard
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className="relative p-6 text-center text-gray-500 dark:text-gray-500 text-sm z-10">
        <p>© 2026 SEO — Sistema de Entrenamiento de Oratoria</p>
      </footer>
    </div>
  );
}
