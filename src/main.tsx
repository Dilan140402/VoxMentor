
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { initTheme } from "./lib/theme";
  import "./styles/index.css";

  // Aplica el tema guardado (oscuro por defecto) antes de pintar la UI.
  initTheme();

  createRoot(document.getElementById("root")!).render(<App />);
  