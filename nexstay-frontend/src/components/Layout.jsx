import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useScrollTop } from '../hooks/useScrollTop';

export default function Layout() {
  useScrollTop();

  return (
    <>
      <Navbar />
      <Outlet />
      <BottomNav />
    </>
  );
}
