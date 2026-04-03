"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Briefcase, BarChart3, Tag, Calendar, Shield, Loader2,
  Pencil, Check, X, BookmarkCheck, Trash2, Clock, Target, Sparkles,
  Terminal, ChevronRight, LogOut, Eye, EyeOff, AlertTriangle, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editDesignation, setEditDesignation] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [saving, setSaving] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

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

      if (!res.ok) throw new Error("Failed to update profile");

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
      setPwError("Passwords do not match.");
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

      if (!res.ok) throw new Error("Failed to change password");

      setPwSuccess("Updated ✓");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordForm(false), 2000);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">Syncing Identity...</p>
      </div>
    );
  }

  if (error || !profile) {
      return (
          <div className="container mx-auto px-6 py-20 text-center animate-fade-in">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Synchronization Failure</h2>
              <p className="text-muted-foreground mb-8">Could not connect to the engineering database. Verify your session.</p>
              <Button onClick={() => window.location.reload()} variant="outline">Retry Node Connection</Button>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-border bg-card mb-12 -mx-4 md:-mx-8 lg:-mx-12 rounded-3xl overflow-hidden">
          <div className="container mx-auto px-6 py-16 max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <Badge variant="purple" className="mb-2 uppercase">Your Workspace</Badge>
              <h1>
                 {profile.name}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                 <span className="flex items-center gap-2 text-sm font-medium"><Mail size={16} className="text-primary" /> {profile.email}</span>
                 <span className="hidden md:block opacity-20">•</span>
                 <span className="text-label text-[10px]">{profile.designation || "Senior Technical Expert"}</span>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="font-bold border-border hover:text-rose-500 hover:border-rose-200">
               <LogOut size={16} className="mr-2" /> Deauthorize session
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="container mx-auto max-w-7xl px-0 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Profile Config */}
              <div className="lg:col-span-2 space-y-12 animate-slide-up">
                  <section className="space-y-6">
                      <h2 className="text-label border-b border-border pb-4">Professional Metadata</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Designation */}
                          <div className="professional-card p-6 group">
                              <div className="flex items-center justify-between mb-2">
                                  <label className="text-label text-[10px] flex items-center gap-2">
                                      <Briefcase size={14} /> Designation
                                  </label>
                                  {editingField !== "designation" && (
                                      <button onClick={() => startEdit("designation")} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity"><Pencil size={12} /></button>
                                  )}
                              </div>
                              {editingField === "designation" ? (
                                  <div className="flex gap-2">
                                      <Input value={editDesignation} onChange={e => setEditDesignation(e.target.value)} className="h-8 text-sm" />
                                      <Button onClick={() => saveEdit("designation")} size="sm" className="h-8" disabled={saving}><Check size={14} /></Button>
                                      <Button onClick={() => setEditingField(null)} variant="outline" size="sm" className="h-8"><X size={14} /></Button>
                                  </div>
                              ) : (
                                  <p className="text-lg font-bold text-foreground">{profile.designation || "Not Set"}</p>
                              )}
                          </div>

                          {/* Proficiency */}
                          <div className="professional-card p-6 group">
                              <div className="flex items-center justify-between mb-2">
                                  <label className="text-label text-[10px] flex items-center gap-2">
                                      <BarChart3 size={14} /> Proficiency
                                  </label>
                                  {editingField !== "skill_level" && (
                                      <button onClick={() => startEdit("skill_level")} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity"><Pencil size={12} /></button>
                                  )}
                              </div>
                              {editingField === "skill_level" ? (
                                  <div className="flex gap-2">
                                      <select value={editSkillLevel} onChange={e => setEditSkillLevel(e.target.value)} className="flex-1 bg-background border border-border rounded text-sm px-2">
                                          {["beginner", "intermediate", "advanced", "expert"].map(l => <option key={l} value={l}>{l}</option>)}
                                      </select>
                                      <Button onClick={() => saveEdit("skill_level")} size="sm" className="h-8" disabled={saving}><Check size={14} /></Button>
                                      <Button onClick={() => setEditingField(null)} variant="outline" size="sm" className="h-8"><X size={14} /></Button>
                                  </div>
                              ) : (
                                  <Badge variant="secondary" className="px-3 py-1 font-bold text-[10px] uppercase bg-primary/5 text-primary border-primary/20">
                                      {profile.skill_level}
                                  </Badge>
                              )}
                          </div>

                          {/* Interests */}
                          <div className="professional-card p-6 md:col-span-2 group">
                               <div className="flex items-center justify-between mb-4">
                                  <label className="text-label text-[10px] flex items-center gap-2">
                                      <Tag size={14} /> Domain Focal Points
                                  </label>
                                  {editingField !== "interests" && (
                                      <button onClick={() => startEdit("interests")} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity"><Pencil size={12} /></button>
                                  )}
                              </div>
                              {editingField === "interests" ? (
                                  <div className="space-y-4">
                                      <Input value={editInterests} onChange={e => setEditInterests(e.target.value)} placeholder="e.g. AI, Rust, WebAssembly" className="h-9 text-sm" />
                                      <div className="flex gap-2">
                                          <Button onClick={() => saveEdit("interests")} size="sm" className="h-8 font-bold" disabled={saving}>Secure Updates</Button>
                                          <Button onClick={() => setEditingField(null)} variant="outline" size="sm" className="h-8 font-bold">Abort</Button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex flex-wrap gap-2">
                                      {profile.interests?.map((tag, i) => (
                                          <Badge key={i} variant="secondary" className="bg-muted text-foreground font-bold lowercase px-3 py-1 border-none">{tag}</Badge>
                                      )) || <span className="text-xs italic text-muted-foreground">Define your domains...</span>}
                                  </div>
                              )}
                          </div>
                      </div>
                  </section>

                  <section className="space-y-8 pt-8">
                       <h2 className="text-label border-l-2 border-primary pl-4">Enrolled Blueprints / {filteredProjects.length}</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filteredProjects.map((e, idx) => (
                              <div
                                  key={e.enrollment_id}
                                  className="professional-card p-6 flex flex-col group cursor-pointer hover:shadow-lg transition-all animate-fade-in"
                                  style={{ animationDelay: `${idx * 50}ms` }}
                                  onClick={() => viewProject(e.project_data)}
                              >
                                  <div className="flex items-start justify-between mb-4">
                                      <Badge variant={e.project_data?.type === 'ai' ? 'success' : 'purple'} className="lowercase">
                                          {e.project_data?.type === 'ai' ? 'Blueprint' : 'Source'}
                                      </Badge>
                                      <button 
                                          className="text-muted-foreground hover:text-rose-500 transition-colors"
                                          onClick={(ev) => { ev.stopPropagation(); unenroll(e.enrollment_id); }}
                                      >
                                          {removingId === e.enrollment_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                      </button>
                                  </div>
                                  <h3 className="group-hover:text-primary transition-colors leading-tight mb-4">{e.title}</h3>
                                  <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Clock size={12} /> {e.project_data?.estimated_time || "4 Weeks"}</span>
                                      <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                  </div>
                              </div>
                          ))}
                          {enrolledProjects.length === 0 && (
                              <div className="md:col-span-2 py-20 text-center border border-dashed border-border rounded-xl">
                                  <BookmarkCheck size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                                  <h3 className="text-lg font-bold text-foreground mb-1">No Active Blueprints</h3>
                                  <p className="text-sm text-muted-foreground mb-8">Generated projects will appear here once secured.</p>
                                  <Link href="/projects">
                                      <Button size="sm" variant="outline" className="font-bold border-border">Open Project Engine</Button>
                                  </Link>
                              </div>
                          )}
                       </div>
                  </section>
              </div>

              {/* Sidebar Config */}
              <aside className="space-y-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                   <div className="professional-card overflow-hidden">
                      <div className="p-6 bg-muted/30 border-b border-border">
                          <h3 className="text-label">Vault Security</h3>
                      </div>
                      <div className="p-8 space-y-8">
                          {!showPasswordForm ? (
                              <Button onClick={() => setShowPasswordForm(true)} variant="outline" className="w-full font-bold border-border h-11">
                                  <Shield size={16} className="mr-2" /> Modify Encryption
                              </Button>
                          ) : (
                              <form onSubmit={changePassword} className="space-y-4 animate-fade-in">
                                  {pwError && <Badge variant="destructive" className="w-full mb-2">{pwError}</Badge>}
                                  {pwSuccess && <Badge variant="success" className="w-full mb-4">{pwSuccess}</Badge>}
                                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="h-10 text-sm" />
                                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="h-10 text-sm" />
                                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New" required className="h-10 text-sm" />
                                  <div className="flex gap-2 pt-2">
                                     <Button type="submit" size="sm" className="flex-1 font-bold h-10" disabled={pwSaving}>Update</Button>
                                     <Button type="button" onClick={() => setShowPasswordForm(false)} variant="ghost" size="sm" className="flex-1 font-bold h-10">Abort</Button>
                                  </div>
                              </form>
                          )}
                      </div>
                   </div>

                   <div className="p-8 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                      <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-primary" />
                          <div className="space-y-0.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Authentication Node Start</p>
                              <p className="text-sm font-bold text-foreground">{profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Active Node"}</p>
                          </div>
                      </div>
                   </div>
              </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
