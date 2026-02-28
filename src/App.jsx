import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; //
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MySkills from "./pages/MySkills";
import Explore from "./pages/Explore";
import Requests from "./pages/Requests";
import ProfileView from "./pages/ProfileView";
import Resources from "./components/Resources";
import Sessions from "./pages/Sessions";

// Updated import paths based on your new folder structure
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      {/* The Toaster component renders the notifications. 
        'toastOptions' allows us to style all toasts globally.
      */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#4f46e5', // Indigo-600 to match your theme
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Main App Layout Wrapper */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-skills" element={<MySkills />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/sessions" element={<Sessions />} />
            
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;