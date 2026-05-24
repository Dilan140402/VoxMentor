import { useEffect, useRef, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

interface FaceMetrics {
  eyeContact: number; // 0-100
  headTilt: number; // grados
  lookingAway: boolean;
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  showFaceMesh: boolean,
  onMetrics: (metrics: FaceMetrics) => void
) {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);

  const init = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarkerRef.current =
      await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU", // CPU más estable que GPU en la mayoría de PCs
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;

    // Esperar a que el video esté listo y tenga dimensiones reales
    if (
      !faceLandmarkerRef.current ||
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0
    ) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const results = faceLandmarkerRef.current.detectForVideo(
      video,
      performance.now()
    );

    if (results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      if (canvasRef.current && showFaceMesh) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && videoRef.current) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "#00FFFF";

          landmarks.forEach((point) => {
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
      else if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");

        if (ctx && canvasRef.current) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
      // Landmarks clave:
      // 1 = punta de nariz, 33 = ojo izquierdo externo, 263 = ojo derecho externo
      const nose = landmarks[1];
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      // Centro entre los ojos
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;

      // Distancia de la nariz al centro de los ojos (indica inclinación de cabeza)
      const horizontalOffset = Math.abs(nose.x - eyeCenterX);

      // Si la nariz está demasiado lejos del centro entre los ojos → no mira a cámara
      const lookingAway =
        nose.x < 0.35 || nose.x > 0.65 || // girado lateralmente
        horizontalOffset > 0.08;            // cabeza ladeada

      // Calcular % de contacto visual de forma más realista
      let eyeContactScore: number;
      if (lookingAway) {
        // Cuanto más lejos del centro, menor puntaje
        const deviation = Math.max(Math.abs(nose.x - 0.5) - 0.15, 0);
        eyeContactScore = Math.max(20, 70 - deviation * 200);
      } else {
        // Mira a cámara: puntaje alto pero no siempre 100%
        eyeContactScore = 80 + (1 - horizontalOffset * 5) * 15;
      }

      onMetrics({
        eyeContact: Math.round(Math.min(100, Math.max(0, eyeContactScore))),
        headTilt: Math.round(horizontalOffset * 100),
        lookingAway,
      });
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, canvasRef, showFaceMesh, onMetrics]);

  useEffect(() => {
    init().then(() => {
      animFrameRef.current = requestAnimationFrame(detect);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      
      if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
  }
  }
  }, [init, detect]);
}