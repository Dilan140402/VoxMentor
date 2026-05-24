import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Users,
  Award,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface OnboardingData {
  role: string;
  goal: string;
  level: string;
}

const roles = [
  { id: "student", title: "Estudiante Universitario", icon: GraduationCap },
  { id: "thesis", title: "Tesista", icon: Award },
  { id: "sales", title: "Vendedor", icon: ShoppingCart },
  { id: "teacher", title: "Docente", icon: Users },
  { id: "speaker", title: "Orador Público", icon: Users },
  { id: "professional", title: "Profesional", icon: Briefcase },
];

const goals = {
  student: [
    { id: "class-presentation", title: "Exponer en clase" },
    { id: "project-presentation", title: "Presentar proyectos académicos" },
    { id: "oral-exam", title: "Examen oral" },
  ],
  thesis: [
    { id: "thesis-defense", title: "Defender tesis" },
    { id: "research-presentation", title: "Presentar investigación" },
    { id: "academic-conference", title: "Conferencia académica" },
  ],
  sales: [
    { id: "sales-pitch", title: "Pitch de ventas" },
    { id: "product-demo", title: "Demostración de producto" },
    { id: "client-meeting", title: "Reunión con cliente" },
  ],
  teacher: [
    { id: "lecture", title: "Dictar clases" },
    { id: "workshop", title: "Talleres y seminarios" },
    { id: "parent-meeting", title: "Reuniones con padres" },
  ],
  speaker: [
    { id: "public-speaking", title: "Hablar en público" },
    { id: "ted-style", title: "Charlas tipo TED" },
    { id: "keynote", title: "Conferencias magistrales" },
  ],
  professional: [
    { id: "work-presentation", title: "Presentar en el trabajo" },
    { id: "job-interview", title: "Entrevista laboral" },
    { id: "team-meeting", title: "Reuniones de equipo" },
  ],
};

const levels = [
  { id: "beginner", title: "Principiante", description: "Poca o ninguna experiencia" },
  {
    id: "intermediate",
    title: "Intermedio",
    description: "Experiencia moderada, buscando mejorar",
  },
  {
    id: "advanced",
    title: "Avanzado",
    description: "Experiencia sólida, refinando habilidades",
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    role: "",
    goal: "",
    level: "",
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem("voxmentor_profile", JSON.stringify(data));
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return data.role !== "";
    if (step === 2) return data.goal !== "";
    if (step === 3) return data.level !== "";
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-2">
              <img src="/logo-seo.png" alt="SEO" className="h-8 w-auto" />
            </h1>
            <p className="text-gray-400">Configura tu perfil de práctica</p>
          </div>

          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= num
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 transition-all ${
                      step > num ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gray-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <h2 className="text-3xl font-bold text-white mb-2">¿Cuál es tu rol?</h2>
                <p className="text-gray-400 mb-8">Selecciona el que mejor te describa</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setData({ ...data, role: role.id, goal: "" })}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          data.role === role.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mb-3 ${
                            data.role === role.id ? "text-blue-400" : "text-gray-400"
                          }`}
                        />
                        <h3 className="font-semibold text-white">{role.title}</h3>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  ¿Cuál es tu objetivo concreto?
                </h2>
                <p className="text-gray-400 mb-8">Define en qué quieres mejorar</p>

                <div className="space-y-3">
                  {data.role &&
                    goals[data.role as keyof typeof goals]?.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setData({ ...data, goal: goal.id })}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          data.goal === goal.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
                        }`}
                      >
                        <h3
                          className={`font-semibold ${
                            data.goal === goal.id ? "text-cyan-400" : "text-white"
                          }`}
                        >
                          {goal.title}
                        </h3>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  ¿Cuál es tu nivel de experiencia?
                </h2>
                <p className="text-gray-400 mb-8">Esto nos ayudará a personalizar tu práctica</p>

                <div className="space-y-4">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setData({ ...data, level: level.id })}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                        data.level === level.id
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
                      }`}
                    >
                      <h3
                        className={`font-semibold text-lg mb-1 ${
                          data.level === level.id ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {level.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          data.level === level.id ? "text-emerald-200" : "text-gray-400"
                        }`}
                      >
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Atrás
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                canProceed()
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {step === 3 ? "Completar" : "Siguiente"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
