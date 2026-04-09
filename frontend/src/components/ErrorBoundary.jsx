/**
 * Error Boundary — intercepte les erreurs React non gérées.
 * Sans cela, une erreur de rendu donne une page blanche sans explication.
 */

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Visible dans la console du navigateur (F12 → Console)
    console.error("[Gradely] Erreur React :", error, info);
  }

  handleReset() {
    // Vider les tokens et recharger — corrige les cas de token corrompu
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
          <div className="max-w-md w-full text-center">
            <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-8">
              <h1 className="text-xl font-semibold text-rose-800 mb-2">
                Une erreur est survenue
              </h1>
              <p className="text-sm text-rose-700 mb-4">
                L'application a rencontré un problème inattendu.
              </p>
              {this.state.error && (
                <pre className="text-left text-xs bg-rose-100 rounded-xl p-3 mb-4 overflow-auto text-rose-900 max-h-40">
                  {this.state.error.message}
                </pre>
              )}
              <button
                onClick={this.handleReset}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition"
              >
                Déconnexion et réessai
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
