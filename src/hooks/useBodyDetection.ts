import { useEffect, useRef, useCallback } from "react";
import {
  FaceLandmarker,
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export interface BodyMetrics {
  // Cara
  eyeContact: number;
  lookingAway: boolean;
  headTilt: number;
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
      }
    } catch (_) {}


    // ── Manos ─────────────────────────────────────────────────
    try {
      if (handRef.current) {
        const handResults = handRef.current.detectForVideo(video, now);
        metrics.handsDetected = handResults.landmarks.length;

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
