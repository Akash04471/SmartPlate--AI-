import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DietPlan from './pages/DietPlan';
import CalorieTracker from './pages/CalorieTracker';
import Progress from './pages/Progress';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/diet-plan" element={<DietPlan />} />
      <Route path="/calorie-tracker" element={<CalorieTracker />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;