import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import '@/platform/install';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { HabitEditPage } from '@/pages/HabitEditPage';
import { HabitHistoryPage } from '@/pages/HabitHistoryPage';
import { HabitNewPage } from '@/pages/HabitNewPage';
import { ManageHabitsPage } from '@/pages/ManageHabitsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TodayPage } from '@/pages/TodayPage';
import { recordSessionVisit } from '@/platform/install';

export function App() {
  useEffect(() => {
    recordSessionVisit();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/habits/:id/history" element={<HabitHistoryPage />} />
        </Route>
        <Route path="/habits/new" element={<HabitNewPage />} />
        <Route path="/habits/manage" element={<ManageHabitsPage />} />
        <Route path="/habits/:id/edit" element={<HabitEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
