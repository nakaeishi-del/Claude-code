import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WebinarList from './pages/WebinarList';
import NewWebinar from './pages/NewWebinar';
import WebinarDetail from './pages/WebinarDetail';
import TaskDetail from './pages/TaskDetail';
import Templates from './pages/Templates';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/webinars" element={<WebinarList />} />
        <Route path="/webinars/new" element={<NewWebinar />} />
        <Route path="/webinars/:id" element={<WebinarDetail />} />
        <Route path="/webinars/:id/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
