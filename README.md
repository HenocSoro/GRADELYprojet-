# Gradely — Suivi de projets universitaires

Application web développée dans le cadre du cours **INF4173** à l'UQO (Hiver 2026).

L'idée de base : permettre aux étudiants de gérer leurs projets de synthèse et de communiquer avec leur superviseur depuis une seule interface. On a ajouté un module IA (OpenAI) pour générer des résumés de l'avancement du projet et proposer des priorités automatiquement.

**Équipe :** SORO Jean-Samuel Henoc · DIALLO Alpha Boubacar

---

## Ce que fait l'application

- Authentification par JWT avec deux rôles : **Étudiant** et **Superviseur**
- Création et gestion de projets
- Gestion des tâches (CRUD) avec statuts, priorités et dates d'échéance
- Tableau de bord étudiant avec progression et alertes (nudges)
- Commentaires par projet, avec affichage du rôle de l'auteur
- Fil d'activité automatique (journal des actions importantes)
- Demandes de supervision — l'étudiant envoie une demande, le superviseur accepte ou refuse
- **Module IA** — résumé automatique du projet + suggestions de priorités via OpenAI (gpt-4o-mini)

---

## Stack

- **Backend :** Django 4 + Django REST Framework
- **Auth :** SimpleJWT
- **Frontend :** React 18 + Vite + Tailwind CSS
- **HTTP :** Axios (avec intercepteurs pour le refresh JWT)
- **IA :** OpenAI API
- **Base de données :** SQLite (dev)

---

## Installation

### Prérequis

- Python 3.10+
- Node.js 18+
- Une clé API OpenAI (seulement pour le module IA)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Sur Windows : .venv\Scripts\activate
pip install -r requirements.txt

# Configurer le .env
cp .env.example .env
# Ouvrir .env et mettre votre clé OpenAI

python manage.py migrate
python manage.py runserver
```

Serveur disponible sur `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface disponible sur `http://localhost:5173`

---

## Variable d'environnement

Le seul fichier `.env` à configurer est `backend/.env` :

```
OPENAI_API_KEY=sk-proj-votre-cle-ici
```

Sans la clé, le module IA retourne une erreur 503 mais tout le reste fonctionne normalement.

---

## Créer des comptes de test

Via l'API directement :

```
POST /api/accounts/register/
{
  "email": "test@example.com",
  "password": "motdepasse123",
  "role": "student"
}
```

Pour un superviseur, utiliser `"role": "supervisor"`. On peut aussi passer par l'interface Django admin (`/admin`) si vous avez créé un superuser avec `python manage.py createsuperuser`.

---

## Structure des dossiers

```
gradely/
├── backend/
│   ├── accounts/        # modèle User + authentification JWT
│   ├── core/            # projets, tâches, commentaires, IA
│   ├── gradely/         # settings + urls Django
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/         # config Axios + intercepteurs
        ├── components/  # composants réutilisables
        └── pages/       # pages de l'app
```

---

## Principaux endpoints

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/login/` | Connexion |
| POST | `/api/accounts/register/` | Inscription |
| GET/POST | `/api/projects/` | Liste / créer un projet |
| GET | `/api/projects/<id>/` | Détail d'un projet |
| GET/POST | `/api/projects/<id>/tasks/` | Tâches |
| GET/POST | `/api/projects/<id>/comments/` | Commentaires |
| GET | `/api/projects/<id>/activity/` | Fil d'activité |
| POST | `/api/projects/<id>/ai-summary/` | Résumé IA |
| GET | `/api/dashboard/student` | Tableau de bord |
| POST | `/api/projects/<id>/supervision-requests/` | Demande de supervision |
| GET | `/api/supervision-requests/` | Voir les demandes |
| PATCH | `/api/supervision-requests/<id>/` | Accepter / refuser |

---

## Auteurs

- **SORO Jean-Samuel Henoc** — architecture backend, API REST, authentification JWT, supervision, dashboard, frontend
- **DIALLO Alpha Boubacar** — module IA (OpenAI), composants frontend (CommentList, ActivityFeed), documentation
