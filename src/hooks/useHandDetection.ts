import { useEffect, useRef, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface HandMetrics {
  handsDetected: number;   // 0, 1 o 2
  isMoving: boolean;       // si las manos se mueven
  gestureScore: number;    // 0-100
}

export function useHandDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  onMetrics: (metrics: HandMetrics) => void
) {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  const init = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });
    } catch (e) {
      console.warn("HandLandmarker no disponible:", e);
    }
  }, []);

  const detect = useCallback(() => {
    if (
      !handLandmarkerRef.current ||
      !videoRef.current ||
      videoRef.current.readyState < 2 ||
      videoRef.current.videoWidth === 0
    ) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const results = handLandmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now()
    );

    const handsDetected = results.landmarks.length;

    if (handsDetected > 0) {
      // Usar la muñeca (landmark 0) de la primera mano para detectar movimiento
      const wrist = results.landmarks[0][0];
      const currentPos = { x: wrist.x, y: wrist.y };

      let isMoving = false;
      let gestureScore = 50;

      if (lastPositionRef.current) {
        const dx = Math.abs(currentPos.x - lastPositionRef.current.x);
        const dy = Math.abs(currentPos.y - lastPositionRef.current.y);
        const movement = Math.sqrt(dx * dx + dy * dy);

        isMoving = movement > 0.01; // umbral de movimiento

        // Movimiento moderado = buen gesto; demasiado = distracción
        if (movement > 0.005 && movement < 0.05) {
          gestureScore = 75 + movement * 500; // buen rango: 75-100
        } else if (movement > 0.05) {
          gestureScore = 60; // movimiento excesivo
        } else {
          gestureScore = 50; // manos quietas
        }
      }

      lastPositionRef.current = currentPos;

      onMetrics({
        handsDetected,
        isMoving,
        gestureScore: Math.min(100, Math.round(gestureScore)),
      });
    } else {
      // Sin manos visibles
      lastPositionRef.current = null;
      onMetrics({ handsDetected: 0, isMoving: false, gestureScore: 30 });
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, onMetrics]);

  useEffect(() => {
    init().then(() => {
      animFrameRef.current = requestAnimationFrame(detect);
    });
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      handLandmarkerRef.current?.close();
    };
  }, [init, detect]);
}
