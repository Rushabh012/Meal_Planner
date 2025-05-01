import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/pageTransition";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Day from "@/pages/day";
import List from "@/pages/list";
import TeethiDays from "@/pages/teethiDays";
import Weekly from "@/pages/weekly";

function Router() {
  const [location] = useLocation();

  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/day/:date" component={Day} />
        <Route path="/list" component={List} />
        <Route path="/teethi" component={TeethiDays} />
        <Route path="/weekly" component={Weekly} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
