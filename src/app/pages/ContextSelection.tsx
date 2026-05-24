import { Link } from "react-router";
import { motion } from "motion/react";
import { GraduationCap, Briefcase, ShoppingCart, Users, Presentation, Lightbulb, ArrowLeft } from "lucide-react";

const contexts = [
  {
    id: "thesis",
    title: "Defensa de Tesis",
    description: "Prepárate para defender tu investigación ante un jurado académico. Evaluamos fluidez técnica, claridad argumental y manejo del nerviosismo.",
    icon: GraduationCap,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "work-presentation",
    title: "Presentación Laboral",
    description: "Presenta proyectos, resultados o propuestas en el trabajo con confianza y profesionalismo.",
    icon: Briefcase,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "sales",
    title: "Venta y Persuasión",
    description: "Mejora tu pitch de ventas. Evaluamos persuasión, tono de confianza y lenguaje corporal efectivo.",
    icon: ShoppingCart,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    id: "public-speaking",
    title: "Hablar en Público",
    description: "Conferencias, charlas y presentaciones ante audiencias grandes con seguridad y carisma.",
    icon: Users,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "class-presentation",
    title: "Exposición en Clase",
    description: "Presenta trabajos y proyectos académicos. Evaluamos estructura lógica, contacto visual y ritmo.",
    icon: Presentation,
    gradient: "from-pink-500 to-pink-600",
  },
  {
    id: "interview",
    title: "Entrevistas",
    description: "Mejora tu comunicación en entrevistas de trabajo o medios. Respuestas claras y convincentes.",
    icon: Lightbulb,
    gradient: "from-yellow-500 to-yellow-600",
  },
];

export function ContextSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      <header className="relative p-6 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold">
          <img src="/logo-seo.png" alt="SEO" className="h-8 w-auto" />
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Selecciona tu Contexto de Práctica
          </h2>
          <p className="text-lg text-gray-400">
            Cada contexto está diseñado con parámetros específicos de evaluación
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contexts.map((context, index) => {
            const Icon = context.icon;
            return (
              <motion.div
                key={context.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/practice/${context.id}`}
                  className="block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-gray-600 transition-all p-6 group h-full"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${context.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {context.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {context.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
