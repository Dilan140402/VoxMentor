import { useEffect, useRef, useCallback } from "react";
import {
  FaceLandmarker,
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export type ExpressionType =
  | "eye-contact"
  | "smile"
  | "frown"
  | "neutral"
  | "looking-away"
  | "exaggerated";

export type ExpressionIntensity = "low" | "medium" | "high";

export interface BodyMetrics {
  // Cara
  eyeContact: number;
  lookingAway: boolean;
  headTilt: number;
  // Expresión facial (derivada de blendshapes reales de MediaPipe)
  expression: ExpressionType;
  expressionIntensity: ExpressionIntensity;
  // Manos
  handsDetected: number;
  gestureScore: number;
  // Postura
  postureScore: number;
  shouldersLevel: boolean;
  isLeaning: boolean;
}

const DEFAULT_METRICS: BodyMetrics = {
  eyeContact: 80,
  lookingAway: false,
  headTilt: 0,
  expression: "neutral",
  expressionIntensity: "low",
  handsDetected: 0,
  gestureScore: 50,
  postureScore: 85,
  shouldersLevel: true,
  isLeaning: false,
};

export function useBodyDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,
  showMesh: boolean,
  onMetrics: (metrics: BodyMetrics) => void
) {
  const faceRef = useRef<FaceLandmarker | null>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const poseRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastHandPosRef = useRef<{ x: number; y: number } | null>(null);
  const initializedRef = useRef(false);

  // ── Inicialización — UNA sola instancia de WASM ──────────────
  const init = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      // UN solo FilesetResolver para los 3 modelos
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      // Cargar los 3 modelos con el mismo runtime
      [faceRef.current, handRef.current, poseRef.current] = await Promise.all([
        FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true, // necesario para detectar sonrisa, ceño, etc.
        }),
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        }),
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        }),
      ]);
    } catch (e) {
      console.warn("useBodyDetection: no se pudo inicializar MediaPipe:", e);
      initializedRef.current = false;
    }
  }, []);

  // ── Loop de detección — UN solo requestAnimationFrame ────────
  const detect = useCallback(() => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      !faceRef.current
    ) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = performance.now();
    const metrics: BodyMetrics = { ...DEFAULT_METRICS };

    // ── Cara ──────────────────────────────────────────────────
    try {
      const faceResults = faceRef.current.detectForVideo(video, now);

      // ── DIBUJAR EN CANVAS si showMesh está activo ──────────
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Ajustar tamaño del canvas al video
          if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (showMesh && faceResults.faceLandmarks.length > 0) {
            const lm = faceResults.faceLandmarks[0];
            ctx.fillStyle = "#00FFFF";
            lm.forEach((point) => {
              ctx.beginPath();
              ctx.arc(
                point.x * canvas.width,
                point.y * canvas.height,
                1.5,
                0,
                2 * Math.PI
              );
              ctx.fill();
            });
          }
        }
      }
      // ───────────────────────────────────────────────────────

      if (faceResults.faceLandmarks.length > 0) {
        const lm = faceResults.faceLandmarks[0];
        const nose = lm[1];
        const leftEye = lm[33];
        const rightEye = lm[263];
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const horizontalOffset = Math.abs(nose.x - eyeCenterX);

        const lookingAway =
          nose.x < 0.35 || nose.x > 0.65 || horizontalOffset > 0.08;

        let eyeContactScore: number;
        if (lookingAway) {
          const deviation = Math.max(Math.abs(nose.x - 0.5) - 0.15, 0);
          eyeContactScore = Math.max(20, 70 - deviation * 200);
        } else {
          eyeContactScore = 80 + (1 - horizontalOffset * 5) * 15;
        }

        metrics.eyeContact = Math.round(Math.min(100, Math.max(0, eyeContactScore)));
        metrics.lookingAway = lookingAway;
        metrics.headTilt = Math.round(horizontalOffset * 100);

        // ── Expresión facial REAL desde blendshapes ──────────────
        // MediaPipe devuelve ~52 categorías (0-1) con nombres como
        // "mouthSmileLeft", "browDownLeft", "jawOpen", etc.
        const categories = faceResults.faceBlendshapes?.[0]?.categories ?? [];
        const bs = (name: string) =>
          categories.find(
            (c: { categoryName?: string; score: number }) =>
              c.categoryName === name
          )?.score ?? 0;

        const smile = (bs("mouthSmileLeft") + bs("mouthSmileRight")) / 2;
        const frown = (bs("browDownLeft") + bs("browDownRight")) / 2;
        const jawOpen = bs("jawOpen");

        // El valor dominante define la expresión mostrada
        let expression: BodyMetrics["expression"] = "neutral";
        let dominantScore = 0;

        if (lookingAway) {
          expression = "looking-away";
          dominantScore = 0.7;
        } else if (jawOpen > 0.55) {
          expression = "exaggerated"; // boca muy abierta / gesto exagerado
          dominantScore = jawOpen;
        } else if (smile > 0.35 && smile >= frown) {
          expression = "smile";
          dominantScore = smile;
        } else if (frown > 0.35) {
          expression = "frown";
          dominantScore = frown;
        } else {
          expression = "eye-contact"; // mira a cámara, rostro relajado
          dominantScore = metrics.eyeContact / 100;
        }

        metrics.expression = expression;
        metrics.expressionIntensity =
          dominantScore > 0.66 ? "high" : dominantScore > 0.4 ? "medium" : "low";
      }
    } catch (_) {}


    // ── Manos ─────────────────────────────────────────────────
    try {
      if (handRef.current) {
        const handResults = handRef.current.detectForVideo(video, now);
        metrics.handsDetected = handResults.landmarks.length;

        // ── DIBUJAR ESQUELETO DE MANOS en el canvas ────────────
        const canvas = canvasRef.current;
        if (canvas && showMesh) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Conexiones entre landmarks (falanges y palma)
            // Índices según MediaPipe Hand Landmarker (21 puntos por mano)
            const HAND_CONNECTIONS: [number, number][] = [
              // Palma
              [0, 1], [0, 5], [0, 17], [5, 9], [9, 13], [13, 17],
              // Pulgar
              [1, 2], [2, 3], [3, 4],
              // Índice
              [5, 6], [6, 7], [7, 8],
              // Medio
              [9, 10], [10, 11], [11, 12],
              // Anular
              [13, 14], [14, 15], [15, 16],
              // Meñique
              [17, 18], [18, 19], [19, 20],
            ];

            handResults.landmarks.forEach((handLandmarks, handIndex) => {
              // Color diferente para cada mano
              const lineColor = handIndex === 0 ? "#00FF88" : "#FF6B35";
              const dotColor  = handIndex === 0 ? "#FFFFFF" : "#FFE566";

              // ── Dibujar líneas (falanges) ──────────────────
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 2;
              HAND_CONNECTIONS.forEach(([a, b]) => {
                const ptA = handLandmarks[a];
                const ptB = handLandmarks[b];
                ctx.beginPath();
                ctx.moveTo(ptA.x * canvas.width, ptA.y * canvas.height);
                ctx.lineTo(ptB.x * canvas.width, ptB.y * canvas.height);
                ctx.stroke();
              });

              // ── Dibujar puntos (articulaciones) ───────────
              handLandmarks.forEach((point, idx) => {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;

                // Puntas de los dedos (4, 8, 12, 16, 20) más grandes
                const isFingertip = [4, 8, 12, 16, 20].includes(idx);
                const radius = isFingertip ? 5 : 3;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = dotColor;
                ctx.fill();

                // Borde negro para destacar
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.stroke();
              });
            });
          }
        }
        // ──────────────────────────────────────────────────────

        if (handResults.landmarks.length > 0) {
          const wrist = handResults.landmarks[0][0];
          const cur = { x: wrist.x, y: wrist.y };

          if (lastHandPosRef.current) {
            const dx = cur.x - lastHandPosRef.current.x;
            const dy = cur.y - lastHandPosRef.current.y;
            const movement = Math.sqrt(dx * dx + dy * dy);

            if (movement > 0.005 && movement < 0.05) {
              metrics.gestureScore = Math.min(100, Math.round(75 + movement * 500));
            } else if (movement >= 0.05) {
              metrics.gestureScore = 60;
            } else {
              metrics.gestureScore = 50;
            }
          }
          lastHandPosRef.current = cur;
        } else {
          lastHandPosRef.current = null;
          metrics.gestureScore = 30;
        }
      }
    } catch (_) {}

    // ── Postura ───────────────────────────────────────────────
    try {
      if (poseRef.current) {
        const poseResults = poseRef.current.detectForVideo(video, now);
        if (poseResults.landmarks.length > 0) {
          const lm = poseResults.landmarks[0];
          const lShoulder = lm[11];
          const rShoulder = lm[12];
          const lHip = lm[23];
          const rHip = lm[24];

          const shoulderDiff = Math.abs(lShoulder.y - rShoulder.y);
          const shoulderCX = (lShoulder.x + rShoulder.x) / 2;
          const hipCX = (lHip.x + rHip.x) / 2;
          const leanAmount = Math.abs(shoulderCX - hipCX);

          metrics.shouldersLevel = shoulderDiff < 0.05;
          metrics.isLeaning = leanAmount > 0.08;

          let score = 100;
          if (!metrics.shouldersLevel) score -= shoulderDiff * 300;
          if (metrics.isLeaning) score -= leanAmount * 200;
          metrics.postureScore = Math.min(100, Math.max(0, Math.round(score)));
        }
      }
    } catch (_) {}

    onMetrics(metrics);
    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, canvasRef, showMesh, onMetrics]);

  useEffect(() => {
    if (!enabled) return;

    init().then(() => {
      animFrameRef.current = requestAnimationFrame(detect);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, init, detect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      faceRef.current?.close();
      handRef.current?.close();
      poseRef.current?.close();
      faceRef.current = null;
      handRef.current = null;
      poseRef.current = null;
      initializedRef.current = false;
    };
  }, []);
}
