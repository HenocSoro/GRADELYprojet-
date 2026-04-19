/** Accueil : résumé projets / tâches. */

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { logout, getAccessToken } from "../api/auth.js";
import Card from "../components/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { FolderOpen, CheckSquare, AlertCircle } from "lucide-react";
import { desola } from "../assets/images/index.js";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
  const normalized = (s) =>
    (s ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const filteredProjects = useMemo(
    () =>
      searchQuery
        ? projects.filter(
            (p) =>
              p.title &&
              normalized(String(p.title)).includes(normalized(searchQuery))
          )
        : projects,
    [projects, searchQuery]
  );
  const isSupervisorOnly =
    currentUser?.is_staff && projects.every((p) => p.owner !== currentUser?.id);

  async function fetchCurrentUser() {
    try {
      const { data } = await api.get("/api/me/");
      setCurrentUser(data);
      return data;
    } catch {
      return null;
    }
  }

  async function fetchProjects() {
    try {
      const { data } = await api.get("/api/projects/");
      // Defensive: toujours un tableau (l'API peut retourner {results:[]} si pagination activée)
      setProjects(Array.isArray(data) ? data : (data?.results ?? []));
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else {
        setError("Impossible de charger les projets.");
      }
      setProjects([]);
    }
  }

  async function fetchDashboard() {
    try {
      const { data } = await api.get("/api/dashboard/student");
      setDashboard(data);
    } catch {
      setDashboard(null);
    }
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    const user = await fetchCurrentUser();
    if (!user) {
      setError("Impossible de récupérer votre profil. Vérifiez votre connexion ou reconnectez-vous.");
      setLoading(false);
      return;
    }
    await Promise.all([fetchProjects(), fetchDashboard()]);
    setLoading(false);
  }

  useEffect(() => {
    if (getAccessToken()) {
      loadAll();
    }
  }, []);

  function isOwner(p) {
    return currentUser && p.owner === currentUser.id;
  }

  function isSupervisorOf(p) {
    return currentUser && p.supervisor === currentUser.id;
  }

  return (
    <div>
      {/* Hero banner — remplacer le style par backgroundImage: "url(...)" quand tu as l'image */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          backgroundImage: `url(${desola})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "180px",
        }}
      >
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0" style={{ background: "rgba(15, 30, 60, 0.65)" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-10 flex items-end justify-between gap-4" style={{ minHeight: "180px" }}>
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {currentUser?.is_staff ? "Espace enseignant" : "Espace étudiant"}
            </p>
            <h1 className="text-3xl font-bold text-white">
              Bonjour{currentUser?.email ? `, ${currentUser.email.split("@")[0]}` : ""}
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              {currentUser?.is_staff && isSupervisorOnly
                ? "Vous supervisez des projets étudiants"
                : "Suivez et gérez vos projets universitaires"}
            </p>
          </div>
          {!currentUser?.is_staff && (
            <button
              onClick={() => navigate("/projects/new")}
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              + Nouveau projet
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Stats */}
      {dashboard?.summary && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Projets</p>
                <p className="mt-2 text-4xl font-bold text-zinc-900">
                  {dashboard.summary.total_projects}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tâches</p>
                <p className="mt-2 text-4xl font-bold text-zinc-900">
                  {dashboard.summary.total_tasks}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-violet-500" />
              </div>
            </div>
          </Card>

          <Card className={`p-5 ${dashboard.summary.overdue_tasks > 0 ? "border-rose-200" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">En retard</p>
                <p className={`mt-2 text-4xl font-bold ${
                  dashboard.summary.overdue_tasks > 0 ? "text-rose-600" : "text-zinc-300"
                }`}>
                  {dashboard.summary.overdue_tasks}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                dashboard.summary.overdue_tasks > 0 ? "bg-rose-50" : "bg-gray-50"
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  dashboard.summary.overdue_tasks > 0 ? "text-rose-500" : "text-gray-300"
                }`} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {dashboard?.nudges && dashboard.nudges.length > 0 && (
        <div className="mt-6 space-y-3">
          {dashboard.nudges.map((n, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm ring-1 ${
                n.severity === "danger"
                  ? "bg-rose-50/80 ring-rose-200 text-rose-800"
                  : "bg-amber-50/80 ring-amber-200 text-amber-800"
              }`}
            >
              <strong>{n.title}</strong> — {n.message}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50/80 px-6 py-4 text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-zinc-500 text-sm">Chargement...</div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card hoverable className="p-6 h-full transition-all duration-200">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-zinc-900 text-lg flex-1 line-clamp-1">
                    {p.title}
                  </h3>
                  <Badge variant="submitted">
                    {isOwner(p) ? "Propriétaire" : "Superviseur"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-zinc-600 line-clamp-2">
                  {p.description || "Aucune description"}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">
                      Progression — {p.progress_percent ?? 0}%
                    </span>
                    {p.supervisor && !isSupervisorOf(p) && (
                      <span className="text-xs text-zinc-400">Superviseur assigné</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(p.progress_percent ?? 0, 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <Card className="mt-8 p-12 text-center">
          <p className="text-zinc-600 font-medium">
            {currentUser?.is_staff
              ? "Aucun projet à superviser pour l'instant"
              : "Aucun projet"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {currentUser?.is_staff
              ? "Les projets vous seront assignés par les étudiants."
              : "Créez votre premier projet pour commencer"}
          </p>
          {!currentUser?.is_staff && (
            <Link to="/projects/new" className="mt-6 inline-block">
              <Button variant="primary">Nouveau projet</Button>
            </Link>
          )}
        </Card>
      )}

      {!loading && projects.length > 0 && filteredProjects.length === 0 && !error && (
        <Card className="mt-8 p-12 text-center">
          <p className="text-zinc-600 font-medium">
            Aucun projet ne correspond à « {searchParams.get("q") ?? ""} »
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Modifiez la recherche dans la barre du haut.
          </p>
        </Card>
      )}

      {/* Section décorative — chapeaux de graduation flottants */}
      <div
        className="mt-12 rounded-3xl overflow-hidden relative flex items-center justify-center"
        style={{
          minHeight: "200px",
          background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 60%, #f5f3ff 100%)",
        }}
      >
        <style>{`
          @keyframes cap-float-1 { 0%,100%{transform:translateY(0px) rotate(-12deg)} 50%{transform:translateY(-22px) rotate(-12deg)} }
          @keyframes cap-float-2 { 0%,100%{transform:translateY(0px) rotate(7deg)}   50%{transform:translateY(-16px) rotate(7deg)} }
          @keyframes cap-float-3 { 0%,100%{transform:translateY(0px) rotate(-5deg)}  50%{transform:translateY(-26px) rotate(-5deg)} }
          @keyframes cap-float-4 { 0%,100%{transform:translateY(0px) rotate(15deg)}  50%{transform:translateY(-18px) rotate(15deg)} }
          @keyframes cap-float-5 { 0%,100%{transform:translateY(0px) rotate(-9deg)}  50%{transform:translateY(-12px) rotate(-9deg)} }
          @keyframes cap-float-6 { 0%,100%{transform:translateY(0px) rotate(4deg)}   50%{transform:translateY(-20px) rotate(4deg)} }
        `}</style>

        <span style={{ position:"absolute", left:"4%",  top:"10%", fontSize:"72px", lineHeight:1, opacity:0.14, animation:"cap-float-1 5.2s ease-in-out infinite",         userSelect:"none" }}>🎓</span>
        <span style={{ position:"absolute", left:"20%", top:"52%", fontSize:"44px", lineHeight:1, opacity:0.09, animation:"cap-float-2 6.8s ease-in-out infinite 0.8s",    userSelect:"none" }}>🎓</span>
        <span style={{ position:"absolute", left:"43%", top:"6%",  fontSize:"58px", lineHeight:1, opacity:0.11, animation:"cap-float-3 4.5s ease-in-out infinite 1.5s",    userSelect:"none" }}>🎓</span>
        <span style={{ position:"absolute", right:"18%",top:"55%", fontSize:"40px", lineHeight:1, opacity:0.08, animation:"cap-float-4 7.1s ease-in-out infinite 0.3s",    userSelect:"none" }}>🎓</span>
        <span style={{ position:"absolute", right:"5%", top:"12%", fontSize:"66px", lineHeight:1, opacity:0.13, animation:"cap-float-5 5.7s ease-in-out infinite 1.2s",    userSelect:"none" }}>🎓</span>
        <span style={{ position:"absolute", left:"70%", top:"42%", fontSize:"36px", lineHeight:1, opacity:0.07, animation:"cap-float-6 6.3s ease-in-out infinite 2s",      userSelect:"none" }}>🎓</span>

        <div className="relative z-10 text-center py-10 px-6">
          <p className="text-blue-900/60 font-semibold text-base">Votre succès académique commence ici</p>
          <p className="text-blue-700/40 text-sm mt-1.5">Organisez, suivez et réussissez vos projets universitaires</p>
        </div>
      </div>
    </div>
    </div>
  );
}
