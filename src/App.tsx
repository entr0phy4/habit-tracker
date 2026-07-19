import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { HabitEditPage } from '@/pages/HabitEditPage';
import { HabitHistoryPage } from '@/pages/HabitHistoryPage';
import { HabitNewPage } from '@/pages/HabitNewPage';
import { ManageHabitsPage } from '@/pages/ManageHabitsPage';
import { TodayPage } from '@/pages/TodayPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/habits/new" element={<HabitNewPage />} />
        <Route path="/habits/manage" element={<ManageHabitsPage />} />
        <Route path="/habits/:id/edit" element={<HabitEditPage />} />
        <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
