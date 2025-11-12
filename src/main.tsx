import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import App from "./App.tsx";
import "./index.css";
import { PierreContextProvider } from "./context/pierreContext.tsx";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, 
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PierreContextProvider>
        <TooltipProvider>
          <App />
          <Toaster />
          <Sonner />
          </TooltipProvider>
        </PierreContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);