/** Demandes de supervision (côté prof). */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { logout } from "../api/auth.js";
import Card from "../components/Card.jsx";
import Badge from "../components/ui/Badge.jsx";

const STATUS_LABELS = {
  pending: "En attente",
  accepted: "Acceptée",
  declined: "Refusée",
};

export default function SupervisionRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [declineMessage, setDeclineMessage] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(null);

  const navigate = useNavigate();

  async function fetchRequests() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/supervision-requests/");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else {
        setError("Impossible de charger les demandes.");
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const receivedPending = requests.filter(
    (r) => r.direction === "received" && r.status === "pending"
  );
  const receivedOther = requests.filter(
    (r) => r.direction === "received" && r.status !== "pending"
  );

  async function handleAccept(requestId) {
    setRespondingId(requestId);
    try {
      await api.patch(`/api/supervision-requests/${requestId}/`, { status: "accepted" });
      await fetchRequests();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.values(err.response?.data || {}).flat().join(" ")
          : err.response?.data) ||
        "Erreur";
      setError(msg);
    } finally {
      setRespondingId(null);
    }
  }

  async function handleDecline(requestId, responseMessage = "") {
    setRespondingId(requestId);
    try {
      await api.patch(`/api/supervision-requests/${requestId}/`, {
        status: "declined",
        response_message: responseMessage,
      });
      setShowDeclineModal(null);
      setDeclineMessage("");
      await fetchRequests();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object"
          ? Object.values(err.response?.data || {}).flat().join(" ")
          : err.response?.data) ||
        "Erreur";
      setError(msg);
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-zinc-900">Demandes de supervision</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Demandes envoyées par les étudiants. Acceptez pour suivre le projet.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50/80 px-6 py-4 text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 text-zinc-500 text-sm">Chargement...</div>
      ) : (
        <div className="mt-8 space-y-8">
          {receivedPending.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-zinc-800 mb-3">
                En attente ({receivedPending.length})
              </h3>
              <div className="space-y-3">
                {receivedPending.map((r) => (
                  <Card key={r.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-900">{r.project_title}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          Étudiant : {r.owner_email}
                        </p>
                        {r.message && (
                          <p className="text-sm text-zinc-600 mt-2 italic">
                            « {r.message} »
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAccept(r.id)}
                          disabled={respondingId !== null}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                        >
                          {respondingId === r.id ? "..." : "Accepter"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeclineModal(r.id)}
                          disabled={respondingId !== null}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {receivedOther.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-zinc-800 mb-3">Traitées</h3>
              <div className="space-y-3">
                {receivedOther.map((r) => (
                  <Card key={r.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-zinc-900">{r.project_title}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{r.owner_email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            r.status === "accepted"
                              ? "approved"
                              : r.status === "declined"
                              ? "rejected"
                              : "pending"
                          }
                        >
                          {STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                        {r.status === "accepted" && (
                          <Link
                            to={`/projects/${r.project_id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Voir le projet →
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {receivedPending.length === 0 && receivedOther.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-zinc-600 font-medium">Aucune demande de supervision</p>
              <p className="text-sm text-zinc-500 mt-1">
                Les demandes des étudiants apparaîtront ici.
              </p>
            </Card>
          )}
        </div>
      )}

      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h3 className="font-semibold text-zinc-900">Refuser la demande</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Message optionnel à l&apos;étudiant :
            </p>
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              placeholder="Ex. : charge de travail trop élevée..."
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleDecline(showDeclineModal, declineMessage)}
                disabled={respondingId !== null}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors"
              >
                {respondingId === showDeclineModal ? "..." : "Refuser"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeclineModal(null);
                  setDeclineMessage("");
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
