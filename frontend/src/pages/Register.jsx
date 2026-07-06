import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, username, email, password } = form;
    if (!fullName || !username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
            Join and start chatting in seconds.
          </p>
        </div>

        <div className="bg-surface-panel border border-white/5 rounded-2xl p-6 shadow-panel">
          <h2 className="font-display text-lg font-semibold text-ink-primary mb-1">
            Create account
          </h2>
          <p className="text-ink-muted text-sm mb-6">It only takes a minute</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Full Name
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Pankaj Yadav"
                className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="pankaj_dev"
                className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="pankaj@example.com"
                className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-surface-elevated border border-white/5 rounded-xl px-4 py-2.5 text-ink-primary text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/40 focus:border-accent-teal/40 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-teal hover:bg-accent-tealDark text-surface font-semibold py-2.5 rounded-xl transition disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-accent-teal font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
