import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import EditPostPage from "./pages/EditPostPage";
import PostPage from "./pages/PostPage";
import CategoriesPage from "./pages/CategoriesPage";
import TagsPage from "./pages/TagsPage";
import DraftsPage from "./pages/DraftsPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./components/AuthContext";
import RegistrationPage from "./pages/RegistrationPage";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        isAuthenticated={isAuthenticated} 
        userProfile={user ? { name: user.name, avatar: undefined } : undefined}
        onLogout={logout} 
      />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/posts/drafts" 
          element={
            <ProtectedRoute>
              <DraftsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/posts/new" 
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/posts/:id/edit" 
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/drafts" 
          element={
            <ProtectedRoute>
              <DraftsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;