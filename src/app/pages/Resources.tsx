import { Link } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  Wind,
  Brain,
  MessageSquare,
  Mic,
  Eye,
  Play,
  Clock,
  Star,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";

const categories = [
  {
    id: "breathing",
    title: "Técnicas de Respiración",
    icon: Wind,
    color: "from-blue-500 to-blue-600",
    resources: [
      {
        title: "Respiración Diafragmática para Oradores",
        duration: "3 min",
        difficulty: "Principiante",
        type: "video",
      },
      {
        title: "Control del Nerviosismo con Respiración",
        duration: "2 min",
        difficulty: "Principiante",
        type: "video",
      },
    ],
  },
  {
    id: "structure",
    title: "Estructura del Discurso",
    icon: MessageSquare,
    color: "from-cyan-500 to-cyan-600",
    resources: [
      {
        title: "Introducción, Desarrollo y Conclusión",
        duration: "5 min",
        difficulty: "Intermedio",
        type: "article",
      },
      {
        title: "Storytelling para Presentaciones",
        duration: "4 min",
        difficulty: "Avanzado",
        type: "video",
      },
    ],
  },
  {
    id: "nerves",
    title: "Manejo del Nerviosismo",
    icon: Brain,
    color: "from-purple-500 to-purple-600",
    resources: [
      {
        title: "Técnicas de Anclaje Emocional",
        duration: "3 min",
        difficulty: "Intermedio",
        type: "video",
      },
      {
        title: "Visualización Positiva Pre-Presentación",
        duration: "2 min",
        difficulty: "Principiante",
        type: "exercise",
      },
    ],
  },
  {
    id: "voice",
    title: "Técnica Vocal",
    icon: Mic,
    color: "from-emerald-500 to-emerald-600",
    resources: [
      {
        title: "Calentamiento Vocal de 5 Minutos",
        duration: "5 min",
        difficulty: "Principiante",
        type: "exercise",
      },
      {
        title: "Proyección de Voz sin Gritar",
        duration: "3 min",
        difficulty: "Intermedio",
        type: "video",
      },
    ],
  },
  {
    id: "body-language",
    title: "Lenguaje Corporal",
    icon: Eye,
    color: "from-orange-500 to-orange-600",
    resources: [
      {
        title: "Gestos que Transmiten Confianza",
        duration: "4 min",
        difficulty: "Principiante",
        type: "video",
      },
      {
        title: "Postura de Poder (Power Poses)",
        duration: "2 min",
        difficulty: "Principiante",
        type: "exercise",
      },
    ],
  },
];

const inspirationalSpeakers = [
  {
    name: "Simon Sinek",
    topic: "Liderazgo e Inspiración",
    example: "Start With Why - TED Talk",
    context: "Hablar en Público",
  },
  {
    name: "Brené Brown",
    topic: "Vulnerabilidad y Conexión",
    example: "The Power of Vulnerability",
    context: "Presentaciones Académicas",
  },
  {
    name: "Steve Jobs",
    topic: "Presentaciones de Producto",
    example: "iPhone Launch 2007",
    context: "Ventas y Pitch",
  },
  {
    name: "Amy Cuddy",
    topic: "Lenguaje Corporal",
    example: "Your Body Language Shapes Who You Are",
    context: "Desarrollo Personal",
  },
];

export function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <nav className="relative border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <img src="/logo-seo.png" alt="SEO" className="h-8 w-auto" />
          </Link>

          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-400" />
            Biblioteca de Recursos
          </h1>
          <p className="text-gray-400 text-lg">
            Micro-lecciones y ejercicios personalizados para mejorar tu oratoria
          </p>
        </motion.div>

        <div className="space-y-8 mb-12">
          {categories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.resources.map((resource, resourceIndex) => (
                    <motion.div
                      key={resourceIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: categoryIndex * 0.1 + resourceIndex * 0.05 }}
                      className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </h3>
                        <Play className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resource.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {resource.difficulty}
                        </div>
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                          {resource.type === "video"
                            ? "Video"
                            : resource.type === "article"
                            ? "Artículo"
                            : "Ejercicio"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Oradores de Referencia</h2>
              <p className="text-gray-400 text-sm">
                Aprende de los mejores comunicadores del mundo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspirationalSpeakers.map((speaker, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-5 hover:border-yellow-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                      {speaker.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{speaker.topic}</p>
                    <div className="text-xs text-cyan-400 mb-1">
                      Ejemplo: {speaker.example}
                    </div>
                    <div className="text-xs text-gray-500">
                      Contexto: {speaker.context}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">
            ¿Listo para poner en práctica lo aprendido?
          </h3>
          <p className="text-gray-400 mb-4">
            Aplica estas técnicas en una sesión de práctica real
          </p>
          <Link
            to="/select-context"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <Play className="w-5 h-5" />
            Iniciar Práctica Ahora
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
