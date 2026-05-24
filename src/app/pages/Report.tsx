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
} from "lucide-react";

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
}

export function Report() {
  const location = useLocation();
  const state = location.state as LocationState;

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay datos de práctica disponibles</p>
          <Link to="/" className="text-indigo-600 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const { stats, duration, contextType } = state;

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

  const getScoreMessage = (score: number) => {
    if (score >= 85) return "¡Excelente presentación!";
    if (score >= 70) return "Muy buen trabajo";
    if (score >= 60) return "Buen progreso";
    return "Necesitas más práctica";
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (stats.fillerWords > 5) {
      recommendations.push({
        type: "critical",
        title: "Reduce las muletillas",
        description: `Detectamos ${stats.fillerWords} muletillas durante tu práctica. Intenta hacer pausas en silencio en lugar de usar 'ehh', 'umm', 'este', etc.`,
        icon: Mic,
      });
    }

    if (stats.eyeContact < 70) {
      recommendations.push({
        type: "warning",
        title: "Mejora el contacto visual",
        description:
          "Tu contacto visual fue del " +
          stats.eyeContact +
          "%. Mira directamente a la cámara más frecuentemente para conectar con tu audiencia.",
        icon: Eye,
      });
    }

    if (stats.handGestures < 70) {
      recommendations.push({
        type: "warning",
        title: "Usa más gestos con las manos",
        description:
          "Los gestos naturales ayudan a enfatizar tus puntos. Practica gesticular de manera más expresiva.",
        icon: Hand,
      });
    }

    if (stats.posture < 80) {
      recommendations.push({
        type: "warning",
        title: "Mejora tu postura",
        description:
          "Mantén la espalda recta y los hombros relajados. Una buena postura transmite confianza y profesionalismo.",
        icon: Users,
      });
    }

    if (stats.voiceTone < 70) {
      recommendations.push({
        type: "warning",
        title: "Trabaja en tu tono de voz",
        description:
          "Varía tu tono de voz para mantener el interés. Evita hablar de manera monótona.",
        icon: Volume2,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        title: "¡Excelente desempeño!",
        description:
          "Has demostrado habilidades sólidas en todos los aspectos. Continúa practicando para mantener este nivel.",
        icon: Trophy,
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const metrics = [
    {
      label: "Contacto Visual",
      value: stats.eyeContact,
      icon: Eye,
      color: stats.eyeContact >= 80 ? "bg-green-500" : stats.eyeContact >= 60 ? "bg-yellow-500" : "bg-red-500",
    },
    {
      label: "Gestos con Manos",
      value: stats.handGestures,
      icon: Hand,
      color: stats.handGestures >= 80 ? "bg-green-500" : stats.handGestures >= 60 ? "bg-yellow-500" : "bg-red-500",
    },
    {
      label: "Postura",
      value: stats.posture,
      icon: Users,
      color: stats.posture >= 80 ? "bg-green-500" : stats.posture >= 60 ? "bg-yellow-500" : "bg-red-500",
    },
    {
      label: "Tono de Voz",
      value: stats.voiceTone,
      icon: Volume2,
      color: stats.voiceTone >= 80 ? "bg-green-500" : stats.voiceTone >= 60 ? "bg-yellow-500" : "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-indigo-600">OratoriaPro</h1>
          <div className="flex gap-3">
            <Link
              to="/select-context"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Nueva Práctica
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reporte de Práctica
            </h2>
            <p className="text-gray-600">{contextType}</p>
            <p className="text-gray-500 text-sm mt-1">Duración: {formatTime(duration)}</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white text-center mb-8">
            <p className="text-sm uppercase tracking-wide mb-2">Puntuación General</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-7xl font-bold mb-2"
            >
              {overallScore}
            </motion.div>
            <p className="text-xl">{getScoreMessage(overallScore)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-2xl text-gray-900">
                      {metric.value}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className={`${metric.color} h-2 rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <Mic className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Muletillas Detectadas</p>
              <p className="text-red-700 text-sm">
                Se detectaron {stats.fillerWords} muletillas durante tu presentación
              </p>
            </div>
            <div className="ml-auto text-3xl font-bold text-red-600">
              {stats.fillerWords}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Recomendaciones para Mejorar
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    rec.type === "critical"
                      ? "bg-red-50 border-red-500"
                      : rec.type === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-green-50 border-green-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        rec.type === "critical"
                          ? "text-red-600"
                          : rec.type === "warning"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    />
                    <div>
                      <h4
                        className={`font-semibold mb-1 ${
                          rec.type === "critical"
                            ? "text-red-900"
                            : rec.type === "warning"
                            ? "text-yellow-900"
                            : "text-green-900"
                        }`}
                      >
                        {rec.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          rec.type === "critical"
                            ? "text-red-700"
                            : rec.type === "warning"
                            ? "text-yellow-700"
                            : "text-green-700"
                        }`}
                      >
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Próximos Pasos
            </h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>
                  Practica regularmente para mejorar tus habilidades de manera consistente
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>
                  Enfócate en las áreas con puntuaciones más bajas para un progreso equilibrado
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>
                  Graba tus sesiones y compara tu progreso a lo largo del tiempo
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span>
                  Experimenta con diferentes contextos para desarrollar versatilidad
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
