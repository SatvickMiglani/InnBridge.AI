"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Briefcase, BarChart3, Tag, Calendar, Shield, Loader2,
  Pencil, Check, X, BookmarkCheck, Trash2, Clock, Target, Sparkles,
  Terminal, ChevronRight, LogOut, Eye, EyeOff, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  designation: string;
  skill_level: string;
  interests: string[];
  created_at: string;
}

interface Enrollment {
  enrollment_id: string;
  title: string;
  project_data: any;
  enrolled_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enrolledProjects, setEnrolledProjects] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = useNavbarSearch();

  const filteredProjects = searchQuery
    ? enrolledProjects.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.project_data?.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    : enrolledProjects;

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editDesignation, setEditDesignation] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [saving, setSaving] = useState(false);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Unenroll states
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const [profileRes, enrolledRes] = await Promise.all([
        fetch(`${API}/users/${userId}`),
        fetch(`${API}/projects/enrolled/${userId}`)
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.data);
      } else {
        throw new Error("Failed to load profile");
      }

      if (enrolledRes.ok) {
        const enrolledData = await enrolledRes.json();
        setEnrolledProjects(enrolledData.data?.projects || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const startEdit = (field: string) => {
    if (!profile) return;
    setEditingField(field);
    if (field === "designation") setEditDesignation(profile.designation || "");
    if (field === "skill_level") setEditSkillLevel(profile.skill_level || "");
    if (field === "interests") setEditInterests((profile.interests || []).join(", "));
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  const saveEdit = async (field: string) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    setSaving(true);
    try {
      const body: any = {};
      if (field === "designation") body.designation = editDesignation.trim();
      if (field === "skill_level") body.skill_level = editSkillLevel.trim();
      if (field === "interests") body.interests = editInterests.split(",").map(s => s.trim()).filter(Boolean);

      const res = await fetch(`${API}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to update");
      }

      const data = await res.json();
      setProfile(data.data);
      setEditingField(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    setPwSaving(true);
    try {
      const res = await fetch(`${API}/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Failed to change password");
      }

      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPwSuccess("");
      }, 2000);
    } catch (err: any) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const unenroll = async (enrollmentId: string) => {
    setRemovingId(enrollmentId);
    try {
      const res = await fetch(`${API}/projects/enrolled/${enrollmentId}`, { method: "DELETE" });
      if (res.ok) {
        setEnrolledProjects(prev => prev.filter(e => e.enrollment_id !== enrollmentId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    router.push("/login");
  };

  const viewProject = (projectData: any) => {
    localStorage.setItem("view_project", JSON.stringify(projectData));
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-muted-foreground">{error || "Failed to load profile"}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchProfile(); }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  const skillLevelOptions = ["beginner", "intermediate", "advanced", "expert"];
  const designationOptions = ["Student", "Researcher", "Engineer", "Designer", "Product Manager", "Other"];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 relative z-10">

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between pt-4 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-primary" /> My Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account, preferences, and enrolled projects</p>
        </div>
        <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl border border-border bg-card/50 text-sm font-medium text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* ─── PROFILE CARD ─── */}
      <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg shadow-primary/20">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-display font-medium">{profile.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" /> {profile.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Designation */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Designation
              </label>
              {editingField !== "designation" && (
                <button onClick={() => startEdit("designation")} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {editingField === "designation" ? (
              <div className="flex gap-2 items-center">
                <select
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="flex-1 h-9 px-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {designationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button onClick={() => saveEdit("designation")} disabled={saving} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-foreground font-medium">{profile.designation || "Not set"}</p>
            )}
          </div>

          {/* Skill Level */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Skill Level
              </label>
              {editingField !== "skill_level" && (
                <button onClick={() => startEdit("skill_level")} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {editingField === "skill_level" ? (
              <div className="flex gap-2 items-center">
                <div className="flex gap-2 flex-1 flex-wrap">
                  {skillLevelOptions.map(lvl => (
                    <button key={lvl} onClick={() => setEditSkillLevel(lvl)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all",
                        editSkillLevel === lvl
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 border-border text-muted-foreground hover:border-primary/40"
                      )}>
                      {lvl}
                    </button>
                  ))}
                </div>
                <button onClick={() => saveEdit("skill_level")} disabled={saving} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={cancelEdit} className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-foreground font-medium capitalize">{profile.skill_level || "Not set"}</p>
            )}
          </div>

          {/* Interests */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 md:col-span-2 group">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Interests
              </label>
              {editingField !== "interests" && (
                <button onClick={() => startEdit("interests")} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-muted">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {editingField === "interests" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Dev, Cryptography"
                  className="w-full h-10 px-4 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-[11px] text-muted-foreground">Separate interests with commas</p>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit("interests")} disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm font-medium flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                  </button>
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.interests && profile.interests.length > 0) ? profile.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    {interest}
                  </span>
                )) : (
                  <span className="text-muted-foreground text-sm">No interests set</span>
                )}
              </div>
            )}
          </div>

          {/* Member Since */}
          <div className="p-5 rounded-2xl bg-card border border-border/60">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </label>
            <p className="text-foreground font-medium">
              {profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}
            </p>
          </div>

          {/* Password */}
          <div className="p-5 rounded-2xl bg-card border border-border/60">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5" /> Password
            </label>
            {!showPasswordForm ? (
              <button onClick={() => setShowPasswordForm(true)} className="text-sm text-primary font-medium hover:underline">
                Change Password
              </button>
            ) : (
              <form onSubmit={changePassword} className="space-y-3">
                {pwError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{pwError}</p>}
                {pwSuccess && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">{pwSuccess}</p>}
                <div className="relative">
                  <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required
                    className="w-full h-9 px-3 pr-9 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required
                    className="w-full h-9 px-3 pr-9 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required
                  className="w-full h-9 px-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <div className="flex gap-2">
                  <button type="submit" disabled={pwSaving} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 disabled:opacity-50">
                    {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />} Update
                  </button>
                  <button type="button" onClick={() => { setShowPasswordForm(false); setPwError(""); setPwSuccess(""); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                    className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── ENROLLED PROJECTS ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-medium flex items-center gap-3">
            <BookmarkCheck className="w-6 h-6 text-primary" /> Enrolled Projects
          </h2>
          <span className="text-sm text-muted-foreground font-medium">{filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}{searchQuery && ` matching "${searchQuery}"`}</span>
        </div>

        {enrolledProjects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <BookmarkCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No enrolled projects yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Go to the Project Hub and enroll in blueprints to save them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((e) => {
              const p = e.project_data;
              const isRemoving = removingId === e.enrollment_id;
              return (
                <div key={e.enrollment_id} onClick={() => viewProject(p)} className={cn(
                  "group flex flex-col bg-card border border-border/50 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 cursor-pointer hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                  isRemoving && "opacity-50 pointer-events-none"
                )}>
                  <div className={cn("absolute top-0 left-0 w-full h-1",
                    p?.type === 'ai' ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"
                  )} />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full border flex items-center gap-1",
                        p?.type === 'ai' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : "border-blue-500/20 text-blue-500 bg-blue-500/10"
                      )}>
                        {p?.type === 'ai' ? <Sparkles className="w-2.5 h-2.5" /> : <Terminal className="w-2.5 h-2.5" />}
                        {p?.type === 'ai' ? "AI" : "GitHub"}
                      </span>
                    </div>
                    <button onClick={(ev) => { ev.stopPropagation(); unenroll(e.enrollment_id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                      title="Remove from enrolled"
                    >
                      {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="text-lg font-display font-bold text-foreground mb-2 leading-tight">{e.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">{p?.description}</p>

                  {p?.proposed_solution && (
                    <p className="text-[11px] text-foreground/40 italic border-l-2 border-primary/20 pl-3 mb-4 line-clamp-2">{p.proposed_solution}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-amber-500" /> Lvl {p?.difficulty_score || "?"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> {p?.estimated_time || "Var"}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Calendar className="w-3.5 h-3.5" />
                      {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Project <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
