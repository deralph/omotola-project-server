import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Materials = lazy(() => import("./pages/Materials"));
const Chat = lazy(() => import("./pages/Chat"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Resources = lazy(() => import("./pages/Resources"));
const Login = lazy(() => import("./pages/Login"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/materials" element={<AppLayout><Materials /></AppLayout>} />
            <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/quizzes" element={<AppLayout><Quizzes /></AppLayout>} />
            <Route path="/progress" element={<AppLayout><Progress /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/recommendations" element={<AppLayout><Recommendations /></AppLayout>} />
            <Route path="/reminders" element={<AppLayout><Reminders /></AppLayout>} />
            <Route path="/resources" element={<AppLayout><Resources /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
