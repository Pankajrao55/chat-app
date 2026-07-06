import { useEffect, useState } from "react";
import { X, MessageSquare, Image as ImageIcon, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../utils/axios.js";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-surface-elevated rounded-xl p-3.5 flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-accent-teal/10 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-accent-teal" />
    </div>
    <div>
      <p className="text-lg font-display font-bold text-ink-primary leading-none">
        {value}
      </p>
      <p className="text-xs text-ink-faint mt-0.5">{label}</p>
    </div>
  </div>
);

const StatsModal = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/users/stats/me");
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData =
    stats?.hourlyActivity?.map((h) => ({
      hour: `${h._id}:00`,
      messages: h.count,
    })) || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-panel border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-panel animate-popIn max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink-primary">
            My Chat Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-ink-muted"
          >
            <X size={18} />
          </button>
        </div>

        {loading && <p className="text-ink-muted text-sm text-center py-8">Loading stats...</p>}

        {!loading && stats && (
          <>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <StatCard icon={MessageSquare} label="Sent" value={stats.totalSent} />
              <StatCard icon={Users} label="Received" value={stats.totalReceived} />
              <StatCard icon={ImageIcon} label="Images" value={stats.totalImages} />
            </div>

            <p className="text-xs font-medium text-ink-muted mb-2">
              Activity by hour of day
            </p>
            <div className="h-40 mb-5">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22314f" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#8b96ac", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: "#8b96ac", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#16223b",
                        border: "1px solid #22314f",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="messages" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-ink-faint text-xs text-center py-10">
                  Send some messages to see activity data
                </p>
              )}
            </div>

            <p className="text-xs font-medium text-ink-muted mb-2">Top contacts</p>
            <div className="space-y-1.5">
              {stats.topContacts.length === 0 && (
                <p className="text-ink-faint text-xs">No conversations yet</p>
              )}
              {stats.topContacts.map((c) => (
                <div
                  key={c.user?._id}
                  className="flex items-center justify-between bg-surface-elevated rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-ink-primary">
                    {c.user?.fullName || "Unknown"}
                  </span>
                  <span className="text-xs text-accent-teal font-mono">
                    {c.messageCount} msgs
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsModal;
