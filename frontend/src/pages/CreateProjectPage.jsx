/** Formulaire nouveau projet. */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { logout } from "../api/auth.js";
import Card from "../components/Card.jsx";

export default function CreateProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/projects/", { title, description });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else {
<<<<<<< HEAD
        // Affiche tous les détails d'erreur (validation, serveur, réseau)
=======
>>>>>>> f75bcda (Amelioration visuelle du frontend : logo, dashboard, navigation, pages)
        const data = err.response?.data;
        let msg = "Impossible de créer le projet.";
        if (data) {
          if (typeof data === "string") msg = data;
          else if (data.detail) msg = data.detail;
          else msg = JSON.stringify(data);
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-zinc-900">Nouveau projet</h2>
      <p className="text-zinc-500 mt-1 text-sm">Créez un nouveau projet universitaire</p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              Titre
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm"
              placeholder="ex: Projet de synthèse 2025"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none text-sm"
              placeholder="Décrivez brièvement votre projet..."
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Création..." : "Créer le projet"}
            </button>
            <Link
              to="/dashboard"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
