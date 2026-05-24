import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { ContextSelection } from "./pages/ContextSelection";
import { Exercises } from "./pages/Exercises";
import { Practice } from "./pages/Practice";
import { Report } from "./pages/ReportEnhanced";
import { Resources } from "./pages/Resources";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/select-context",
    Component: ContextSelection,
  },
  {
    path: "/exercises",
    Component: Exercises,
  },
  {
    path: "/practice/:contextType",
    Component: Practice,
  },
  {
    path: "/report",
    Component: Report,
  },
  {
    path: "/resources",
    Component: Resources,
  },
  { path: "/login", 
    Component: Login 
  },
]);
