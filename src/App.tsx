import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './state/AppContext';
import Landing from './pages/Landing';
import Platform from './pages/Platform';
import { PhoneFrame, WorkerLayout } from './components/PhoneShell';
import { DemoControls } from './components/DemoControls';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Protect from './screens/Protect';
import ClaimFlow from './screens/ClaimFlow';
import Weather from './screens/Weather';
import Grow from './screens/Grow';
import BounceBack from './screens/BounceBack';
import Activity from './screens/Activity';
import Profile from './screens/Profile';

function WorkerApp() {
  const { w } = useApp();
  return (
    <>
      <PhoneFrame>
        {!w.onboarded ? (
          <Onboarding />
        ) : (
          <WorkerLayout>
            <Routes>
              <Route index element={<Home />} />
              <Route path="protect" element={<Protect />} />
              <Route path="protect/claim" element={<ClaimFlow />} />
              <Route path="weather" element={<Weather />} />
              <Route path="grow" element={<Grow />} />
              <Route path="bounce" element={<BounceBack />} />
              <Route path="activity" element={<Activity />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </WorkerLayout>
        )}
      </PhoneFrame>
      {w.onboarded && <DemoControls />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app/*" element={<WorkerApp />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
