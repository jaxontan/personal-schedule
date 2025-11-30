import { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Dashboard } from './features/dashboard/Dashboard';
import { TaskBoard } from './features/tasks/TaskBoard';
import { WeeklyCalendar } from './features/calendar/WeeklyCalendar';
import { DeadlineTimeline } from './features/timeline/DeadlineTimeline';
import { Button } from './components/ui/Button';
import { LayoutDashboard, ListTodo, Calendar, Clock, Sun, Moon } from 'lucide-react';
import { cn } from './utils/cn';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/ui/PageTransition';

function AppContent() {
  const [view, setView] = useState<'dashboard' | 'tasks' | 'calendar' | 'timeline'>('dashboard');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col items-center py-8 gap-6 z-50 shadow-xl">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'timeline', icon: Clock, label: 'Timeline' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200",
                view === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title={item.label}
            >
              <item.icon className="h-6 w-6" />
            </button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-14 h-14 rounded-xl hover:bg-accent/50"
        >
          {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="ml-20 min-h-screen">
        <div className="container mx-auto p-8">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <PageTransition key="dashboard">
                <Dashboard />
              </PageTransition>
            )}
            {view === 'tasks' && (
              <PageTransition key="tasks">
                <TaskBoard />
              </PageTransition>
            )}
            {view === 'calendar' && (
              <PageTransition key="calendar">
                <WeeklyCalendar />
              </PageTransition>
            )}
            {view === 'timeline' && (
              <PageTransition key="timeline">
                <DeadlineTimeline />
              </PageTransition>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 py-3 flex justify-around shadow-2xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'tasks', icon: ListTodo },
          { id: 'calendar', icon: Calendar },
          { id: 'timeline', icon: Clock },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={cn(
              "p-3 rounded-lg transition-all",
              view === item.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
