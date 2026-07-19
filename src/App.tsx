import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { HabitNewPage } from '@/pages/HabitNewPage';
import { TodayPage } from '@/pages/TodayPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/habits/new" element={<HabitNewPage />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
