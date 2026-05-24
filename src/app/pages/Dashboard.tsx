import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Award,
  Play,
  BookOpen,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const profile = JSON.parse(localStorage.getItem("voxmentor_profile") || "{}");

  // ── DATOS REALES DESDE SUPABASE ────────────────────────────────
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) setSessions(data);
      setLoading(false);
    };
    loadSessions();
  }, []);

  // ── DATOS DERIVADOS (todos dentro del componente, usan sessions) ──
  const progressData = sessions.map((s, i) => ({
    session: `S${i + 1}`,
    score: s.overall_score,
  }));

  const totalMinutes = sessions.reduce((a, s) => a + s.duration_seconds, 0) / 60;
  const formattedTime = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`
    : `${Math.round(totalMinutes)}m`;

  const realStats = [
    {
      label: "Sesiones Totales",
      value: loading ? "…" : sessions.length.toString(),
      icon: BarChart3,
      color: "text-blue-400",
    },
    {
      label: "Mejor Puntaje",
      value: loading ? "…" : sessions.length
        ? Math.max(...sessions.map(s => s.overall_score)) + "/100"
        : "—",
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      label: "Tiempo Total",
      value: loading ? "…" : sessions.length ? formattedTime : "0m",
      icon: Clock,
      color: "text-cyan-400",
    },
    {
      label: "Racha Actual",
      value: "—",
      icon: Flame,
      color: "text-orange-400",
    },
  ];

  // Logros dinámicos basados en sesiones reales
  const hasNoFillerSession = sessions.some(s => s.filler_words === 0);
  const hasPerfectPosture = sessions.some(s => s.posture_score >= 95);
  const expertSessions = sessions.filter(s => s.overall_score >= 90).length;

  const achievements = [
    {
      id: "first-session",
      title: "Primera Sesión",
      description: "Completaste tu primera práctica",
      icon: Play,
      unlocked: sessions.length >= 1,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "no-fillers",
      title: "Sin Muletillas",
      description: "0 muletillas en una sesión",
      icon: CheckCircle,
      unlocked: hasNoFillerSession,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "perfect-posture",
      title: "Postura Perfecta",
      description: "Postura 95%+ sostenida",
      icon: Award,
      unlocked: hasPerfectPosture,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "week-streak",
      title: "Racha Semanal",
      description: "7 días consecutivos practicando",
      icon: Flame,
      unlocked: false,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "expert",
      title: "Experto en Oratoria",
      description: "Puntaje 90+ en 5 sesiones",
      icon: Trophy,
      unlocked: expertSessions >= 5,
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  // Sistema de nivel: 3 estrellas por sesión completada
  const totalStars = sessions.length * 3;
  const starsPerLevel = 15;
  const currentLevel = Math.floor(totalStars / starsPerLevel) + 1;
  const starsInCurrentLevel = totalStars % starsPerLevel;
  const progressPercentage = (starsInCurrentLevel / starsPerLevel) * 100;
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <nav className="relative border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <img src="/logo-seo.png" alt="SEO" className="h-8 w-auto" />
              VoxMentor
            </span>
          </Link>

          <div className="flex gap-4">
            <Link
              to="/exercises"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              <Play className="w-4 h-4" />
              Nueva Práctica
            </Link>
            <Link
              to="/resources"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <BookOpen className="w-4 h-4" />
              Recursos
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {profile.role && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  Perfil: {profile.role} • Objetivo: {profile.goal}
                </h2>
                <p className="text-gray-400 text-sm">Experiencia: {profile.level}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Nivel {currentLevel}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{totalStars}</span>
                  <span>estrellas ganadas</span>
                </div>
              </div>
              <div className="relative w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow">
                  {starsInCurrentLevel} / {starsPerLevel}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {starsPerLevel - starsInCurrentLevel} estrellas para Nivel {currentLevel + 1}
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {realStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Progreso de Puntaje
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                  Semanal
                </button>
                <button className="px-3 py-1 text-gray-400 rounded-lg text-sm hover:bg-gray-700">
                  Mensual
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Cargando sesiones…
                </div>
              ) : progressData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Aún no tienes sesiones. ¡Empieza a practicar!
                </div>
              ) : (
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="session" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Próxima Sesión
            </h3>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4 mb-4">
              <p className="text-cyan-400 font-semibold mb-1">Recomendada para ti</p>
              <p className="text-white text-sm mb-3">Enfoque: Reducción de muletillas</p>
              <Link
                to="/practice/filler-words-focus?focus=muletillas"
                className="w-full block text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm font-medium"
              >
                Comenzar Ahora
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-300">Duración estimada: 10-15 min</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="text-gray-300">Métricas a evaluar: 5</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-gray-300">Dificultad: Intermedia</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Logros
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`relative p-4 rounded-xl border-2 ${
                    achievement.unlocked
                      ? "border-gray-700 bg-gray-900/50"
                      : "border-gray-800 bg-gray-900/30 opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color}`
                        : "bg-gray-800"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4
                    className={`text-sm font-semibold text-center mb-1 ${
                      achievement.unlocked ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {achievement.title}
                  </h4>
                  <p
                    className={`text-xs text-center ${
                      achievement.unlocked ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
