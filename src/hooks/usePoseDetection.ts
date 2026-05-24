import { useEffect, useRef, useCallback } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface PoseMetrics {
  postureScore: number;    // 0-100
  shouldersLevel: boolean; // hombros nivelados
  isLeaning: boolean;      // inclinado hacia adelante/atrás
}

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  onMetrics: (metrics: PoseMetrics) => void
) {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);

  const init = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    } catch (e) {
      console.warn("PoseLandmarker no disponible:", e);
    }
  }, []);

  const detect = useCallback(() => {
    if (
      !poseLandmarkerRef.current ||
      !videoRef.current ||
      videoRef.current.readyState < 2 ||
      videoRef.current.videoWidth === 0
    ) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const results = poseLandmarkerRef.current.detectForVideo(
      videoRef.current,
      performance.now()
    );

    if (results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];

      // Landmarks clave: 11=hombro izq, 12=hombro der, 23=cadera izq, 24=cadera der
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      // Calcular si los hombros están nivelados
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const shouldersLevel = shoulderDiff < 0.05;

      // Calcular si está inclinado (hombros vs caderas)
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const hipCenterX = (leftHip.x + rightHip.x) / 2;
      const leanAmount = Math.abs(shoulderCenterX - hipCenterX);
      const isLeaning = leanAmount > 0.08;

      // Calcular score de postura
      let postureScore = 100;
      if (!shouldersLevel) postureScore -= shoulderDiff * 300;
      if (isLeaning) postureScore -= leanAmount * 200;

      onMetrics({
        postureScore: Math.min(100, Math.max(0, Math.round(postureScore))),
        shouldersLevel,
        isLeaning,
      });
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, onMetrics]);

  useEffect(() => {
    init().then(() => {
      animFrameRef.current = requestAnimationFrame(detect);
    });
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      poseLandmarkerRef.current?.close();
    };
  }, [init, detect]);
}
