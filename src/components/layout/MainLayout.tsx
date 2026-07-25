import { Outlet } from 'react-router';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { BottomTabBar } from './BottomTabBar';

export function MainLayout() {
  return (
    <>
      <Outlet />
      <InstallBanner />
      <BottomTabBar />
    </>
  );
}
