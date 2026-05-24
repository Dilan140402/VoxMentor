import { useState, useEffect, useRef,useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  Mic,
  Eye,
  Hand,
  Users,
  Volume2,
  CheckCircle,
  AlertTriangle,
  StopCircle,
  Frown,
  Smile,
  Meh,
  EyeOff,
  MessageCircle,
  Zap,
} from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { supabase } from "../../lib/supabase";
import { generateAIReport } from "../../lib/generateReport";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { useHandDetection } from "../../hooks/useHandDetection";
import { usePoseDetection } from "../../hooks/usePoseDetection";

// FIX 2: Declarar tipos globales de SpeechRecognition para TypeScript
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Feedback {
  id: string;
  type: "success" | "warning";
  message: string;
  timestamp: number;
}

interface DetectionStats {
  fillerWords: number;
  eyeContact: number;
  handGestures: number;
  posture: number;
  voiceTone: number;
}

interface FacialExpression {
  type: "eye-contact" | "smile" | "frown" | "neutral" | "looking-away" | "exaggerated";
  intensity: "low" | "medium" | "high";
  timestamp: number;
}

const INITIAL_STATS: DetectionStats = {
  fillerWords: 0,
  eyeContact: 85,
  handGestures: 70,
  posture: 90,
  voiceTone: 75,
};

const FILLER_WORDS = [
  "eh", "ehh", "este", "o sea", "básicamente",
  "literalmente", "osea", "emmm", "ummm", "bueno", "pues",
];

export function Practice() {
  const { contextType } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [facialExpressions, setFacialExpressions] = useState<FacialExpression[]>([]);
  const [practiceText, setPracticeText] = useState<string>("");
  const [stats, setStats] = useState<DetectionStats>({
    fillerWords: 0,
    eyeContact: 85,
    handGestures: 70,
    posture: 90,
    voiceTone: 75,
  });

  // FIX 3: Todos los refs juntos al inicio del componente (Rules of Hooks)
  const micStreamRef = useRef<MediaStream | null>(null);
  const lastProcessedTranscriptRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFaceMesh, setShowFaceMesh] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fillerWordsRef = useRef<number>(0);
  const transcriptRef = useRef<string>("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  // Ref para evitar stale closure en recognition.onend
  const isRecordingRef = useRef(false);

  // Sincronizar isRecordingRef con el estado reactivo
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // addUniqueFeedback: no repite el mismo mensaje en pantalla
  const addUniqueFeedback = useCallback((newFeedback: Feedback) => {
    setFeedback((prev) => {
      const exists = prev.some((item) => item.message === newFeedback.message);
      if (exists) return prev;
      return [newFeedback, ...prev].slice(0, 5);
    });
  }, []);

  // FIX 4: useFaceDetection movido aquí, al nivel correcto del componente (Rules of Hooks)
    useFaceDetection(
      videoRef,
      canvasRef,
      showFaceMesh,
      (metrics) => {
        setStats((prev) => ({
          ...prev,
          eyeContact: metrics.eyeContact,
        }));

        if (metrics.lookingAway && isRecording) {
          setFeedback((prev) => [
            {
              id: Date.now().toString(),
              type: "warning",
              message:
                "Mantén el contacto visual con la cámara.",
              timestamp: Date.now(),
            },
            ...prev.slice(0, 4),
          ]);
        }
      }
  );

  // ── DETECCIÓN DE MANOS REAL (MediaPipe HandLandmarker) ────────
  useHandDetection(videoRef, (metrics) => {
    setStats((prev) => ({ ...prev, handGestures: metrics.gestureScore }));

    if (isRecording && metrics.handsDetected === 0) {
      addUniqueFeedback({
        id: Date.now().toString(),
        type: "warning",
        message: "No se detectan tus manos. Muéstralas para analizar gestos.",
        timestamp: Date.now(),
      });
    }
  });
  // ─────────────────────────────────────────────────────────────

  // ── DETECCIÓN DE POSTURA REAL (MediaPipe PoseLandmarker) ──────
  usePoseDetection(videoRef, (metrics) => {
    setStats((prev) => ({ ...prev, posture: metrics.postureScore }));

    if (isRecording && metrics.isLeaning) {
      addUniqueFeedback({
        id: Date.now().toString(),
        type: "warning",
        message: "Detectamos que estás inclinado. Mantén la espalda recta.",
        timestamp: Date.now(),
      });
    }

    if (isRecording && !metrics.shouldersLevel) {
      addUniqueFeedback({
        id: Date.now().toString(),
        type: "warning",
        message: "Nivela tus hombros. Estás encorvado hacia un lado.",
        timestamp: Date.now(),
      });
    }
  });
  // ─────────────────────────────────────────────────────────────

  // ── CÁMARA REAL ──────────────────────────────────────────────
    const startCamera = useCallback(async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(
        "Error accediendo a cámara:",
        error
      );

      alert(
        "Debes permitir acceso a cámara y micrófono."
      );
    }
  }, []);

  const stopCamera =useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Encender cámara al entrar, apagarla al salir de la página
  useEffect(() => {
    startCamera();

    return () => {
      stopSpeechRecognition();
      stopMicrophoneDetection();
      stopCamera();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (detectionRef.current) {
        clearInterval(detectionRef.current);
      }
    };
}, [startCamera, stopCamera]);
  // ─────────────────────────────────────────────────────────────

    const contextTitles: Record<string, string> = {
      thesis: "Defensa de Tesis",
      "work-presentation":
        "Presentación Laboral",
      sales: "Venta y Persuasión",
      "public-speaking":
        "Hablar en Público",
      "class-presentation":
        "Exposición en Clase",
      interview: "Entrevistas",
  };
  const contextDescriptions: Record<string, string> = {
    thesis:
      "Simula un jurado académico. Enfoque: fluidez técnica, claridad argumental, manejo del nerviosismo.",
    "work-presentation":
      "Simula una reunión profesional. Enfoque: estructura, confianza, engagement con audiencia.",
    sales:
      "Simula una reunión con cliente. Enfoque: persuasión, tono de confianza, lenguaje corporal efectivo.",
    "public-speaking":
      "Simula una audiencia grande. Enfoque: proyección, carisma, manejo del escenario.",
    "class-presentation":
      "Simula un aula virtual. Enfoque: estructura lógica, contacto visual, ritmo apropiado.",
    interview:
      "Simula una entrevista formal. Enfoque: claridad, respuestas concisas, presencia profesional.",
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      startDetection();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (detectionRef.current) clearInterval(detectionRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (detectionRef.current) clearInterval(detectionRef.current);
    };
  }, [isRecording]);

  const startDetection = () => {
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
    }
    detectionRef.current = setInterval(() => {
      const random = Math.random();

      // Detección de expresiones faciales
      const expressionRandom = Math.random();
      if (expressionRandom < 0.2) {
        const expressions: FacialExpression["type"][] = [
          "eye-contact",
          "smile",
          "frown",
          "neutral",
          "looking-away",
          "exaggerated",
        ];
        const intensities: FacialExpression["intensity"][] = ["low", "medium", "high"];

        const newExpression: FacialExpression = {
          type: expressions[Math.floor(Math.random() * expressions.length)],
          intensity: intensities[Math.floor(Math.random() * intensities.length)],
          timestamp: Date.now(),
        };

        setFacialExpressions((prev) => [...prev.slice(-4), newExpression]);
      }

      if (random < 0.25) {
        addFeedback({
          id: Date.now().toString(),
          type: "warning",
          message: "Contacto visual bajo. Mira más a la cámara.",
          timestamp: Date.now(),
        });
        setStats((prev) => ({ ...prev, eyeContact: Math.max(0, prev.eyeContact - 5) }));
      } else if (random < 0.45) {
        addFeedback({
          id: Date.now().toString(),
          type: "warning",
          message: "Postura encorvada. Mantén la espalda recta.",
          timestamp: Date.now(),
        });
        setStats((prev) => ({ ...prev, posture: Math.max(0, prev.posture - 5) }));
      } else if (random < 0.65) {
        addFeedback({
          id: Date.now().toString(),
          type: "success",
          message: "Excelente contacto visual mantenido.",
          timestamp: Date.now(),
        });
        setStats((prev) => ({ ...prev, eyeContact: Math.min(100, prev.eyeContact + 3) }));
      }
    }, 3000);
  };

  const addFeedback = (newFeedback: Feedback) => {
    setFeedback((prev) => [newFeedback, ...prev].slice(0, 5));
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startSpeechRecognition = () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "es-ES"; // es-PE no está soportado por Web Speech API
    recognition.continuous = true;
    recognition.interimResults = true;  // muestra texto mientras hablas
    recognition.maxAlternatives = 1;

    // Reiniciar automáticamente si se corta (stale closure arreglado con isRecordingRef)
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start(); } catch (_) { /* ya reiniciando */ }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' es normal (silencio), no mostrar alerta
      if (event.error === "no-speech") return;
      console.error("SpeechRecognition error:", event.error);
      addUniqueFeedback({
        id: Date.now().toString(),
        type: "warning",
        message: "Error detectando voz. Verifica el micrófono.",
        timestamp: Date.now(),
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // ── PATRÓN CORRECTO: iterar desde resultIndex, no solo el último ──
      // Acumula los finales en transcriptRef y los interim se muestran al instante
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          // Texto confirmado: acumular en ref permanente
          transcriptRef.current += text + " ";

          // Detectar muletillas solo en texto final (más fiable, sin falsos positivos)
          const lowerText = text.toLowerCase();
          FILLER_WORDS.forEach((word) => {
            if (lowerText.includes(word)) {
              fillerWordsRef.current += 1;
              setStats((prev) => ({ ...prev, fillerWords: fillerWordsRef.current }));
              addUniqueFeedback({
                id: Date.now().toString(),
                type: "warning",
                message: `Muletilla detectada: "${word}". Intenta pausar en silencio.`,
                timestamp: Date.now(),
              });
            }
          });
        } else {
          // Texto interim: acumular para mostrar al instante mientras el usuario habla
          interimText += text;
        }
      }

      // Actualizar display: finales confirmados + lo que está diciendo ahora mismo
      // Esto hace que el texto aparezca palabra por palabra sin esperar a isFinal
      setLiveTranscript(transcriptRef.current + interimText);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopSpeechRecognition = () => {
  if (recognitionRef.current) {
    recognitionRef.current.onend = null;
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }
};
  const startMicrophoneDetection = async () => {
    try {
      const stream = streamRef.current;
      micStreamRef.current = stream;
      if (!stream) return;

      const audioContext = new AudioContext();

      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;

      const microphone =
        audioContext.createMediaStreamSource(stream);

      microphone.connect(analyser);

      const dataArray = new Uint8Array(
        analyser.frequencyBinCount
      );

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      const detectVolume = () => {
        analyser.getByteFrequencyData(dataArray);

        let values = 0;

        for (let i = 0; i < dataArray.length; i++) {
          values += dataArray[i];
        }

        const average = values / dataArray.length;

        const normalized = Math.min(
          100,
          Math.round((average / 255) * 100 * 2)
        );

        setMicLevel(normalized);

        // ── Conectar volumen real a stats.voiceTone ──────────────
        if (normalized > 5) {
          // Hay voz: calcular score de calidad según rango de volumen
          let voiceScore: number;
          if (normalized < 15) {
            voiceScore = 40;               // voz muy baja
          } else if (normalized < 30) {
            voiceScore = 65;               // voz baja
          } else if (normalized <= 70) {
            voiceScore = 85 + (normalized - 30) * 0.3; // rango ideal → 85-97
          } else {
            voiceScore = 90 - (normalized - 70) * 0.5; // muy alto → baja
          }
          // Suavizado: 85% valor anterior + 15% nuevo → sin saltos bruscos
          setStats((prev) => ({
            ...prev,
            voiceTone: Math.round(prev.voiceTone * 0.85 + voiceScore * 0.15),
          }));
        } else {
          // Silencio: bajar gradualmente
          setStats((prev) => ({
            ...prev,
            voiceTone: Math.max(20, Math.round(prev.voiceTone * 0.98)),
          }));
        }
        // ─────────────────────────────────────────────────────────

        animationRef.current =
          requestAnimationFrame(detectVolume);
      };

      detectVolume();
  } catch (error) {
    console.error(
      "Error detectando micrófono:",
      error
    );
  }
};
  const stopMicrophoneDetection = () => {
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    

    analyserRef.current?.disconnect();

    microphoneRef.current?.disconnect();

    audioContextRef.current?.close();

    setMicLevel(0);
  };
  const resetPractice = async () => {

  // detener timers
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  if (detectionRef.current) {
    clearInterval(detectionRef.current);
    detectionRef.current = null;
  }

  // detener speech
  stopSpeechRecognition();

  // detener cámara
  stopCamera();

  // limpiar estados
  setIsRecording(false);

  setTimeElapsed(0);

  setFeedback([]);

  setFacialExpressions([]);

  setStats(INITIAL_STATS);

  setLiveTranscript("");

  setMicLevel(0);

  stopMicrophoneDetection();
  // limpiar refs
  fillerWordsRef.current = 0;

  transcriptRef.current = "";

  // limpiar canvas
  if (canvasRef.current) {
    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      ctx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  }

  // reiniciar cámara
  await startCamera();
};
  // FIX 6: saveSession definida para poder llamarla en handleStop
  const saveSession = async (sessionData: {
    contextType: string;
    duration: number;
    stats: DetectionStats;
    transcript: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("sessions").insert({
      user_id: user.id,
      context_type: sessionData.contextType,
      duration_seconds: sessionData.duration,
      filler_words: sessionData.stats.fillerWords,
      eye_contact_pct: sessionData.stats.eyeContact,
      posture_score: sessionData.stats.posture,
      voice_score: sessionData.stats.voiceTone,
      gestures_score: sessionData.stats.handGestures,
      overall_score: Math.round(
        (sessionData.stats.eyeContact +
          sessionData.stats.posture +
          sessionData.stats.voiceTone +
          sessionData.stats.handGestures) / 4
      ),
      transcript: sessionData.transcript,
    });

    if (error) console.error("Error guardando sesión:", error);
  };

  const handleStart = async() => {
    await resetPractice(); // Reiniciar todo antes de empezar
    
    setIsRecording(true);
    startSpeechRecognition();
    await startMicrophoneDetection(); // FIX 7: ahora sí se llama
    addFeedback({
      id: Date.now().toString(),
      type: "success",
      message: "Grabación iniciada. ¡Comienza tu presentación!",
      timestamp: Date.now(),
    });
  };

  const handleStop = async () => {
    setIsRecording(false);
    setIsGeneratingReport(true); // ← activa el spinner en el botón

    if (timerRef.current) clearInterval(timerRef.current);
    if (detectionRef.current) clearInterval(detectionRef.current);

    stopSpeechRecognition();
    stopMicrophoneDetection();
    stopCamera();

    const currentStats = { ...stats, fillerWords: fillerWordsRef.current };
    const transcript = transcriptRef.current.trim().replace(/\s+/g, " ");
    const savedDuration = timeElapsed;       // ← guardar ANTES de resetPractice
    const savedContextType = contextType;    // ← guardar ANTES de resetPractice

    try {
      // 1. Guardar en Supabase (no bloquea el flujo si falla)
      await saveSession({
        contextType: savedContextType || "general",
        duration: savedDuration,
        stats: currentStats,
        transcript,
      }).catch((err) => console.warn("saveSession falló (sin login?):", err));

      // 2. Generar reporte con Gemini
      const report = await generateAIReport({
        contextType: savedContextType || "general",
        duration: savedDuration,
        fillerWords: currentStats.fillerWords,
        eyeContact: currentStats.eyeContact,
        posture: currentStats.posture,
        voiceTone: currentStats.voiceTone,
        gestures: currentStats.handGestures,
        transcript,
      });

      await resetPractice();

      navigate("/report", {
        state: {
          stats: currentStats,
          report,
          duration: savedDuration,
          contextType: contextTitles[savedContextType || ""] || "Práctica General",
        },
      });

    } catch (error) {
      // Si Gemini falla, navegar igual con mensaje de error
      console.error("Error generando reporte:", error);
      await resetPractice();
      navigate("/report", {
        state: {
          stats: currentStats,
          report:
            "No se pudo generar el reporte automático. Revisa tu conexión a internet o la API key de Gemini en el archivo .env",
          duration: savedDuration,
          contextType: contextTitles[savedContextType || ""] || "Práctica General",
        },
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />

      <header className="relative bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                VoxMentor
              </span>
            </h1>
            <p className="text-sm text-gray-400">
              {contextTitles[contextType || ""] || "Práctica"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-400">
              {contextDescriptions[contextType || ""] || "Entorno de práctica personalizado"}
            </div>
            <div className="text-3xl font-mono font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {formatTime(timeElapsed)}
            </div>
          </div>
        </div>
      </header>

      <main className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1800px] mx-auto">
        <div className="lg:col-span-2 space-y-6">
          {/* Subir archivo de texto para práctica */}
          {!isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                Texto de Práctica (Opcional)
              </h3>
              <FileUpload onFileContent={setPracticeText} />
              {practiceText && (
                <p className="text-gray-400 text-xs mt-2">
                  ✓ Texto cargado ({practiceText.length} caracteres)
                </p>
              )}
            </motion.div>
          )}

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden aspect-video relative">
            {/* ── VIDEO REAL DE LA CÁMARA ── */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {/* Overlay cuando la cámara aún no arrancó (sin stream) */}
            {!streamRef.current && (
              <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-20 h-20 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 text-lg">Iniciando cámara…</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Acepta el permiso que pide el navegador
                  </p>
                </div>
              </div>
            )}

            {/* Badge REC visible durante grabación */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              </div>
            )}

            {/* Mensaje sutil cuando la cámara está activa pero aún no grabando */}
            {!isRecording && streamRef.current && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300">
                  Cámara activa — presiona{" "}
                  <span className="text-emerald-400 font-semibold">Iniciar Práctica</span>{" "}
                  cuando estés listo
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Muletillas", value: stats.fillerWords, icon: Mic, suffix: "", gradient: "from-yellow-500 to-orange-500" },
              { label: "Contacto Visual", value: stats.eyeContact, icon: Eye, suffix: "%", gradient: "from-blue-500 to-cyan-500" },
              { label: "Gestos", value: stats.handGestures, icon: Hand, suffix: "%", gradient: "from-purple-500 to-pink-500" },
              { label: "Postura", value: stats.posture, icon: Users, suffix: "%", gradient: "from-emerald-500 to-green-500" },
              { label: "Tono de Voz", value: stats.voiceTone, icon: Volume2, suffix: "%", gradient: "from-cyan-500 to-blue-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              const getColor = (value: number) => {
                if (stat.suffix === "") return "text-yellow-400";
                if (value >= 80) return "text-emerald-400";
                if (value >= 60) return "text-cyan-400";
                return "text-red-400";
              };

              return (
                <div
                  key={stat.label}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-4 rounded-xl text-center hover:border-gray-600 transition-all"
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <div className={`text-2xl font-bold ${getColor(stat.value)}`}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4">
            {!isRecording ? (
  <button
    onClick={handleStart}
    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
  >
    <Video className="w-5 h-5" />
    Iniciar Práctica
  </button>
) : (
  <div className="flex gap-4 w-full">
    <button
      onClick={handleStop}
      disabled={isGeneratingReport}
      className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
        isGeneratingReport
          ? "bg-gray-600 cursor-not-allowed opacity-80"
          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
      }`}
    >
      {isGeneratingReport ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Generando reporte con IA...
        </>
      ) : (
        <>
          <StopCircle className="w-5 h-5" />
          Detener y Ver Reporte
        </>
      )}
    </button>

    <button
      onClick={() => setShowFaceMesh((prev) => !prev)}
      className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 transition-all whitespace-nowrap"
    >
      {showFaceMesh
        ? "Ocultar puntos"
        : "Mostrar puntos"}
    </button>
  </div>
)}
          </div>
        </div>

        <div className="space-y-6">
          {/* Micrófono en tiempo real */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                Nivel de Voz
              </h3>

              <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${micLevel}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                  }}
                  className={`h-full rounded-full ${
                    micLevel > 70
                      ? "bg-red-500"
                      : micLevel > 40
                      ? "bg-yellow-400"
                      : "bg-emerald-400"
                  }`}
                />
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {micLevel < 10
                  ? "Silencio"
                  : micLevel < 50
                  ? "Hablando normal"
                  : "Volumen alto"}
              </p>
            </motion.div>
          )}

          {/* Transcripción en vivo */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                Transcripción en Vivo
              </h3>

              <div className="bg-gray-900/60 rounded-lg p-3 h-40 overflow-y-auto">
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {liveTranscript
                    ? liveTranscript.split(" ").slice(-50).join(" ")
                    : <span className="text-gray-500 italic">Empieza a hablar...</span>}
                </p>
              </div>
            </motion.div>
          )}
          {/* Indicadores visuales de expresiones faciales */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Expresiones Detectadas
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {facialExpressions.slice(-6).map((expr, index) => {
                  const getExpressionIcon = () => {
                    switch (expr.type) {
                      case "eye-contact": return <Eye className="w-5 h-5" />;
                      case "smile":       return <Smile className="w-5 h-5" />;
                      case "frown":       return <Frown className="w-5 h-5" />;
                      case "neutral":     return <Meh className="w-5 h-5" />;
                      case "looking-away":  return <EyeOff className="w-5 h-5" />;
                      case "exaggerated":   return <AlertTriangle className="w-5 h-5" />;
                    }
                  };

                  const getExpressionLabel = () => {
                    switch (expr.type) {
                      case "eye-contact":   return "Contacto visual";
                      case "smile":         return "Sonrisa";
                      case "frown":         return "Ceño fruncido";
                      case "neutral":       return "Neutral";
                      case "looking-away":  return "Mirando a otro lado";
                      case "exaggerated":   return "Expresión exagerada";
                    }
                  };

                  const getColor = () => {
                    if (expr.type === "eye-contact" || expr.type === "smile") {
                      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
                    } else if (expr.type === "looking-away" || expr.type === "exaggerated") {
                      return "text-red-400 bg-red-500/10 border-red-500/30";
                    }
                    return "text-gray-400 bg-gray-700/30 border-gray-600/30";
                  };

                  return (
                    <motion.div
                      key={`${expr.timestamp}-${index}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${getColor()}`}
                    >
                      {getExpressionIcon()}
                      <span className="text-xs text-center leading-tight">
                        {getExpressionLabel()}
                      </span>
                      <span className="text-xs opacity-60">{expr.intensity}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Retroalimentación en Tiempo Real */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 overflow-hidden flex flex-col h-[calc(100vh-400px)]">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cyan-400" />
              <span className="text-white">Retroalimentación en Tiempo Real</span>
            </h3>

            {!isRecording && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">
                    Los indicadores aparecerán cuando inicies la práctica
                  </p>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                <AnimatePresence>
                  {feedback.slice(0, 5).map((item) => {
                    const d = new Date(item.timestamp);
                    const timeLabel = [
                      d.getHours().toString().padStart(2, "0"),
                      d.getMinutes().toString().padStart(2, "0"),
                      d.getSeconds().toString().padStart(2, "0"),
                    ].join(":");

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 rounded-lg border flex items-start gap-3 ${
                          item.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >
                        {item.type === "success" ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200 leading-relaxed">{item.message}</p>
                          <span className="text-xs text-gray-500 mt-1 block">{timeLabel}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
