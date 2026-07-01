import { useLocation, Link } from "react-router";
import { motion } from "motion/react";
import {
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Home,
  RotateCcw,
  Eye,
  Hand,
  Users,
  Volume2,
  Mic,
  Play,
  Zap,
  Target,
  Calendar,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { ThemeToggle } from "../components/ThemeToggle";

interface LocationState {
  stats: {
    fillerWords: number;
    eyeContact: number;
    handGestures: number;
    posture: number;
    voiceTone: number;
  };
  duration: number;
  contextType: string;
  report?: string;
}

interface VideoFragment {
  timestamp: string;
  issue: string;
  severity: "high" | "medium" | "low";
}

export function Report() {
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No hay datos de práctica disponibles</p>
          <Link to="/" className="text-blue-400 underline hover:text-blue-300">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const { stats, duration, contextType, report } = state;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateOverallScore = () => {
    const average =
      (stats.eyeContact + stats.handGestures + stats.posture + stats.voiceTone) / 4;
    const fillerPenalty = Math.min(stats.fillerWords * 2, 20);
    return Math.max(0, Math.round(average - fillerPenalty));
  };

  const overallScore = calculateOverallScore();
  const previousScore = 68;

  const getScoreMessage = (score: number) => {
    if (score >= 85) return "¡Excelente presentación!";
    if (score >= 70) return "Muy buen trabajo";
    if (score >= 60) return "Buen progreso";
    return "Necesitas más práctica";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-400 to-green-400";
    if (score >= 70) return "from-blue-400 to-cyan-400";
    if (score >= 60) return "from-yellow-400 to-orange-400";
    return "from-red-400 to-red-500";
  };

  const videoFragments: VideoFragment[] = [
    { timestamp: "0:45", issue: "Uso repetido de 'básicamente'", severity: "high" },
    { timestamp: "2:14", issue: "Contacto visual perdido (10 segundos)", severity: "medium" },
    { timestamp: "3:22", issue: "Manos en bolsillos", severity: "medium" },
    { timestamp: "4:05", issue: "Muletilla 'o sea' detectada 3 veces", severity: "high" },
    { timestamp: "5:18", issue: "Postura encorvada", severity: "low" },
  ];

  const topStrengths = [
    {
      title: "Excelente modulación de voz",
      description: "Tu tono de voz fue variado y apropiado, manteniendo el interés de la audiencia.",
      icon: Volume2,
    },
    {
      title: "Postura corporal fuerte",
      description: "Mantuviste una postura erguida y profesional durante la mayor parte de la presentación.",
      icon: Users,
    },
    {
      title: "Buena estructura del discurso",
      description: "Tu presentación siguió una estructura lógica y fácil de seguir.",
      icon: Target,
    },
  ];

  const topImprovements = [
    {
      title: "Reducir muletillas",
      description: `Detectamos ${stats.fillerWords} muletillas. Practica hacer pausas en silencio en lugar de usar 'ehh', 'o sea', 'básicamente'.`,
      exercise: "Ejercicio: Graba un discurso de 2 minutos. Cada vez que uses una muletilla, reinicia desde el principio.",
      icon: Mic,
    },
    {
      title: "Mejorar contacto visual",
      description: `Tu contacto visual fue del ${stats.eyeContact}%. Mira directamente a la cámara con más frecuencia.`,
      exercise: "Ejercicio: Practica frente al espejo, manteniendo contacto visual contigo mismo durante 30 segundos seguidos.",
      icon: Eye,
    },
    {
      title: "Gesticulación más expresiva",
      description: "Usa más gestos naturales con las manos para enfatizar puntos clave.",
      exercise: "Ejercicio: Graba tu discurso y observa tus manos. ¿Están aportando o distraen?",
      icon: Hand,
    },
  ];

  const radarData = [
    { category: "Contacto Visual", value: stats.eyeContact, fullMark: 100 },
    { category: "Gestos", value: stats.handGestures, fullMark: 100 },
    { category: "Postura", value: stats.posture, fullMark: 100 },
    { category: "Tono de Voz", value: stats.voiceTone, fullMark: 100 },
    { category: "Fluidez", value: Math.max(0, 100 - stats.fillerWords * 5), fullMark: 100 },
  ];

  const comparisonData = [
    { metric: "Sesión Anterior", score: previousScore },
    { metric: "Esta Sesión", score: overallScore },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <header className="relative border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <img src="/logo-seo.png" alt="SEO" className="h-8 w-auto invert dark:invert-0" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/select-context"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Nueva Práctica
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Reporte Completo</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{contextType}</p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div>Duración: {formatTime(duration)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Puntuación General</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`text-7xl font-bold mb-2 bg-gradient-to-r ${getScoreColor(overallScore)} bg-clip-text text-transparent`}
              >
                {overallScore}
              </motion.div>
              <p className="text-xl text-gray-900 dark:text-white mb-4">{getScoreMessage(overallScore)}</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                {overallScore > previousScore ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      +{overallScore - previousScore} puntos vs. sesión anterior
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">Primera sesión registrada</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Comparación con Sesión Anterior</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="url(#barGradient)" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Análisis Multidimensional
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Radar
                    name="Desempeño"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {[
                { label: "Contacto Visual", value: stats.eyeContact, icon: Eye, color: "blue" },
                { label: "Gestos con Manos", value: stats.handGestures, icon: Hand, color: "purple" },
                { label: "Postura", value: stats.posture, icon: Users, color: "emerald" },
                { label: "Tono de Voz", value: stats.voiceTone, icon: Volume2, color: "cyan" },
              ].map((metric, index) => {
                const Icon = metric.icon;
                const getBarColor = (val: number) => {
                  if (val >= 80) return "bg-emerald-500";
                  if (val >= 60) return "bg-cyan-500";
                  return "bg-yellow-500";
                };

                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{metric.label}</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={`${getBarColor(metric.value)} h-3 rounded-full`}
                      />
                    </div>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
              >
                <Mic className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-300 mb-1">Muletillas Detectadas</p>
                  <p className="text-red-200 text-sm">
                    Se detectaron {stats.fillerWords} muletillas durante tu presentación
                  </p>
                </div>
                <div className="text-3xl font-bold text-red-400">{stats.fillerWords}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              Top 3 Fortalezas
            </h3>

            <div className="space-y-4">
              {topStrengths.map((strength, index) => {
                const Icon = strength.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-300 mb-1">{strength.title}</h4>
                        <p className="text-emerald-100 text-sm">{strength.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              Top 3 Áreas de Mejora
            </h3>

            <div className="space-y-4">
              {topImprovements.map((improvement, index) => {
                const Icon = improvement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-300 mb-1">{improvement.title}</h4>
                        <p className="text-yellow-100 text-sm mb-2">{improvement.description}</p>
                        <div className="bg-yellow-900/30 rounded px-3 py-2 mt-2">
                          <p className="text-xs text-yellow-200">{improvement.exercise}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Play className="w-6 h-6 text-red-400" />
            Fragmentos de Video Marcados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Momentos clave donde detectamos oportunidades de mejora
          </p>

          <div className="space-y-3">
            {videoFragments.map((fragment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className={`p-4 rounded-lg border flex items-center gap-4 ${
                  fragment.severity === "high"
                    ? "bg-red-500/10 border-red-500/30"
                    : fragment.severity === "medium"
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Play
                    className={`w-5 h-5 ${
                      fragment.severity === "high"
                        ? "text-red-400"
                        : fragment.severity === "medium"
                        ? "text-yellow-400"
                        : "text-blue-400"
                    }`}
                  />
                  <div className="font-mono font-bold text-gray-900 dark:text-white">{fragment.timestamp}</div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm">{fragment.issue}</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    fragment.severity === "high"
                      ? "bg-red-500/20 text-red-300"
                      : fragment.severity === "medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {fragment.severity === "high"
                    ? "Alta prioridad"
                    : fragment.severity === "medium"
                    ? "Prioridad media"
                    : "Mejora menor"}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── REPORTE GENERADO POR IA (Gemini) ── */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Análisis de tu Coach IA
              </span>
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                {report}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Siguiente Sesión Recomendada
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Basado en tu desempeño, te recomendamos enfocarte en:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-400 mb-2">Objetivo Principal</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Reducción de muletillas a menos de 3</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-400 mb-2">Objetivo Secundario</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Mejorar contacto visual a 85%+</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-400 mb-2">Duración Sugerida</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">10-12 minutos</p>
            </div>
          </div>

          <Link
            to="/select-context"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Comenzar Nueva Sesión
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
