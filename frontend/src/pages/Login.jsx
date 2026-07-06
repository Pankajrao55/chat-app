import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center mb-4 animate-popIn">
            <MessageCircle className="text-accent-teal" size={26} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-primary">
            ChatSphere
          </h1>
          <p className="text-ink-muted text-sm mt-1 font-body">
            Real-time conversations, instantly.
          </p>
        </div>

        <div className="bg-surface-panel border border-white/5 rounded-2xl p-6 shadow-panel">
          <h2 className="font-display text-lg font-semibold text-ink-primary mb-1">
            Welcome back
          </h2>
          <p className="text-ink-muted text-sm mb-6">Sign in to continue chatting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="pankaj_dev"
                className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-teal hover:bg-accent-tealDark text-surface font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-accent-teal font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
