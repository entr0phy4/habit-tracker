import { Outlet } from 'react-router';
import { BottomTabBar } from './BottomTabBar';

export function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  );
}
