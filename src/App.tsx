import { useState } from 'react';
import { TaskProvider } from './context/TaskContext';
import { DailyTaskProvider } from './context/DailyTaskContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Dashboard } from './features/dashboard/Dashboard';
import { TaskBoard } from './features/tasks/TaskBoard';
import { DailyTaskBoard } from './features/daily/DailyTaskBoard';
import { WeeklyCalendar } from './features/calendar/WeeklyCalendar';
import { DeadlineTimeline } from './features/timeline/DeadlineTimeline';
import { Button } from './components/ui/Button';
import { LayoutDashboard, ListTodo, Calendar, Clock, Sun, Moon, CalendarCheck, Columns, X } from 'lucide-react';
import { cn } from './utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { PageTransition } from './components/ui/PageTransition';

function AppContent() {
  const [view, setView] = useState<'dashboard' | 'tasks' | 'daily' | 'calendar' | 'timeline'>('dashboard');
  const [splitView, setSplitView] = useState<'dashboard' | 'tasks' | 'daily' | 'calendar' | 'timeline' | null>(null);
  const { theme, toggleTheme } = useTheme();

  const toggleSplitView = () => {
    if (splitView) {
      setSplitView(null);
    } else {
      // Default to dashboard if current view is not dashboard, otherwise daily
      setSplitView(view === 'dashboard' ? 'daily' : 'dashboard');
    }
  };

  const renderView = (viewName: string) => {
    switch (viewName) {
      case 'dashboard': return <Dashboard />;
      case 'daily': return <DailyTaskBoard />;
      case 'tasks': return <TaskBoard />;
      case 'calendar': return <WeeklyCalendar />;
      case 'timeline': return <DeadlineTimeline />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'daily', icon: CalendarCheck, label: 'Daily Tasks' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'timeline', icon: Clock, label: 'Timeline' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-card/80 backdrop-blur-xl border-r border-border/50 flex-col items-center py-8 gap-6 z-50 shadow-xl">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {navItems.map((item) => (
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

          <div className="w-10 h-px bg-border/50 my-2" />

          <button
            onClick={toggleSplitView}
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200",
              splitView
                ? "bg-accent text-accent-foreground shadow-inner"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            title="Toggle Split Screen"
          >
            <Columns className="h-6 w-6" />
          </button>
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
      <main className="ml-0 md:ml-20 min-h-screen transition-all duration-300 flex">
        {/* Primary View */}
        <div className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          splitView ? "w-1/2 border-r border-border/50" : "w-full"
        )}>
          <div className="container mx-auto p-4 md:p-8 h-full overflow-y-auto">
            <AnimatePresence mode="wait">
              <PageTransition key={view}>
                {renderView(view)}
              </PageTransition>
            </AnimatePresence>
          </div>
        </div>

        {/* Split View */}
        <AnimatePresence>
          {splitView && (
            <motion.div
              className="hidden md:flex flex-col w-1/2 bg-card/30 backdrop-blur-sm h-screen sticky top-0 overflow-hidden border-l border-border/50 shadow-2xl"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Split View</span>
                  <select
                    value={splitView}
                    onChange={(e) => setSplitView(e.target.value as any)}
                    className="bg-transparent border border-border rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {navItems.map(item => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSplitView(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <PageTransition key={`split-${splitView}`}>
                  {renderView(splitView)}
                </PageTransition>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-2 py-3 flex justify-around shadow-2xl z-50 safe-area-bottom">
        {navItems.map((item) => (
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
        <DailyTaskProvider>
          <AppContent />
        </DailyTaskProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
