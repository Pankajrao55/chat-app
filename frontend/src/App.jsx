import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";

function App() {
  const { authUser, checkingAuth } = useAuth();

  if (checkingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent-teal border-t-transparent animate-spin" />
          <p className="text-ink-muted text-sm font-body">Loading ChatSphere...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#16223b",
            color: "#e7ecf5",
            border: "1px solid #22314f",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/register"
          element={!authUser ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/" element={authUser ? <Chat /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
