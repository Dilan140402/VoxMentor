import { Link } from "react-router";
import { motion } from "motion/react";
import { Star, ArrowLeft, Target, Clock, Trophy } from "lucide-react";


interface Exercise {
  id: string;
  title: string;
  description: string;
  focus: string;
  difficulty: number;
  duration: string;
  stars: number;
  contextType: string;
}

const exercisesByRole: Record<string, Exercise[]> = {
  student: [
    {
      id: "ex1",
      title: "Presentación de Proyecto Académico",
      description: "Practica presentar un proyecto universitario con estructura clara",
      focus: "Estructura lógica y claridad",
      difficulty: 1,
      duration: "8-10 min",
      stars: 3,
      contextType: "class-presentation",
    },
    {
      id: "ex2",
      title: "Exposición con Diapositivas",
      description: "Presenta usando apoyo visual, mantén contacto con audiencia",
      focus: "Contacto visual y gestos",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "class-presentation",
    },
    {
      id: "ex3",
      title: "Debate Académico",
      description: "Argumenta tu posición con confianza y fluidez",
      focus: "Argumentación y control de nervios",
      difficulty: 3,
      duration: "12-15 min",
      stars: 5,
      contextType: "class-presentation",
    },
  ],
  thesis: [
    {
      id: "ex4",
      title: "Introducción y Justificación",
      description: "Practica la apertura de tu defensa de tesis",
      focus: "Claridad argumental",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "thesis",
    },
    {
      id: "ex5",
      title: "Metodología y Resultados",
      description: "Explica tu proceso de investigación con fluidez técnica",
      focus: "Fluidez técnica y precisión",
      difficulty: 3,
      duration: "15-18 min",
      stars: 5,
      contextType: "thesis",
    },
    {
      id: "ex6",
      title: "Defensa ante Preguntas Difíciles",
      description: "Responde preguntas complejas del jurado con confianza",
      focus: "Manejo del nerviosismo",
      difficulty: 3,
      duration: "12-15 min",
      stars: 5,
      contextType: "thesis",
    },
  ],
  sales: [
    {
      id: "ex7",
      title: "Pitch Elevator (30 segundos)",
      description: "Vende tu producto en 30 segundos de forma persuasiva",
      focus: "Persuasión y tono de confianza",
      difficulty: 1,
      duration: "5-7 min",
      stars: 3,
      contextType: "sales",
    },
    {
      id: "ex8",
      title: "Presentación de Producto",
      description: "Demuestra las características y beneficios de tu producto",
      focus: "Lenguaje corporal efectivo",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "sales",
    },
    {
      id: "ex9",
      title: "Manejo de Objeciones",
      description: "Responde objeciones del cliente con seguridad",
      focus: "Persuasión y confianza",
      difficulty: 3,
      duration: "12-15 min",
      stars: 5,
      contextType: "sales",
    },
  ],
  teacher: [
    {
      id: "ex10",
      title: "Explicación de Concepto Complejo",
      description: "Enseña un tema difícil de forma clara y didáctica",
      focus: "Claridad y ritmo apropiado",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "public-speaking",
    },
    {
      id: "ex11",
      title: "Taller Interactivo",
      description: "Dirige un taller manteniendo el engagement del grupo",
      focus: "Contacto visual y energía",
      difficulty: 2,
      duration: "12-15 min",
      stars: 4,
      contextType: "public-speaking",
    },
    {
      id: "ex12",
      title: "Gestión de Aula Virtual",
      description: "Enseña en formato virtual con presencia efectiva",
      focus: "Presencia digital y tono",
      difficulty: 3,
      duration: "15-18 min",
      stars: 5,
      contextType: "public-speaking",
    },
  ],
  speaker: [
    {
      id: "ex13",
      title: "Apertura Impactante",
      description: "Comienza tu charla captando la atención inmediata",
      focus: "Carisma y proyección",
      difficulty: 2,
      duration: "8-10 min",
      stars: 4,
      contextType: "public-speaking",
    },
    {
      id: "ex14",
      title: "Storytelling Persuasivo",
      description: "Cuenta una historia que conecte emocionalmente",
      focus: "Conexión emocional",
      difficulty: 3,
      duration: "12-15 min",
      stars: 5,
      contextType: "public-speaking",
    },
    {
      id: "ex15",
      title: "Cierre Memorable",
      description: "Termina tu charla con un call-to-action poderoso",
      focus: "Proyección y energía",
      difficulty: 2,
      duration: "8-10 min",
      stars: 4,
      contextType: "public-speaking",
    },
  ],
  professional: [
    {
      id: "ex16",
      title: "Presentación de Resultados",
      description: "Presenta métricas y resultados a tu equipo",
      focus: "Estructura y confianza",
      difficulty: 1,
      duration: "8-10 min",
      stars: 3,
      contextType: "work-presentation",
    },
    {
      id: "ex17",
      title: "Propuesta de Proyecto",
      description: "Propón una nueva iniciativa al liderazgo",
      focus: "Persuasión profesional",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "work-presentation",
    },
    {
      id: "ex18",
      title: "Entrevista de Trabajo",
      description: "Responde preguntas de entrevista con claridad y seguridad",
      focus: "Presencia profesional",
      difficulty: 2,
      duration: "10-12 min",
      stars: 4,
      contextType: "interview",
    },
  ],
};

export function Exercises() {
  const profile = JSON.parse(localStorage.getItem("voxmentor_profile") || "{}");
  const userRole = profile.role || "student";
  const exercises = exercisesByRole[userRole] || exercisesByRole.student;

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return "Principiante";
    if (difficulty === 2) return "Intermedio";
    return "Avanzado";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return "from-green-500 to-emerald-600";
    if (difficulty === 2) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <header className="relative border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              VoxMentor
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-cyan-400" />
            Ejercicios de Práctica
          </h1>
          <p className="text-gray-400 text-lg">
            Ejercicios diseñados para tu perfil: {profile.role || "Estudiante"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white text-xs font-semibold`}>
                  {getDifficultyLabel(exercise.difficulty)}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < exercise.stars
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{exercise.title}</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {exercise.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-400">Enfoque:</span>
                  <span className="text-cyan-400 font-medium">{exercise.focus}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Duración:</span>
                  <span className="text-blue-400 font-medium">{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">Recompensa:</span>
                  <span className="text-yellow-400 font-medium">{exercise.stars} estrellas</span>
                </div>
              </div>

              <Link
                to={`/practice/${exercise.contextType}?exerciseId=${exercise.id}`}
                className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all text-center"
              >
                Comenzar Ejercicio
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
