import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js") // ✅ correct path
    .then(() => console.log("✅ Service Worker registered!"))
    .catch((err) => console.error("❌ SW registration failed:", err));
}

