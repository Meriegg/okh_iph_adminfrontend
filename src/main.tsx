import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client.ts";
import { Sidebar } from "./components/sidebar.tsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="w-full p-6 h-full flex flex-row items-start justify-start gap-6">
          <Sidebar />

          <App />
        </div>

        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
