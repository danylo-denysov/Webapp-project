# Task-Board – full-stack task-management app

A Trello-style board that lets teams organise work into **Boards → Task Groups → Tasks** with drag-and-drop ordering.


## Key features

- **Authentication** - JWT (access + refresh) in HttpOnly cookies; refresh-token rotation; role guards (`admin`, `user`).
- **Task workflow** - CRUD for boards, groups and tasks; order preserved via `order` integer column.
- **REST API** - Prefixed with **`/api`**.
- **Database** - PostgreSQL schema in 3-NF, entities & migrations handled by TypeORM.

## Database schema

![ER diagram](docs/erd.png)

<details>
<summary>Table overview</summary>

| Table | Description |
|-------|-------------|
| **user** | Account and profile (stores hashed refresh token). |
| **board** | Top-level container; owned by a user, shareable. |
| **task_group** | Column with tasks on a board. |
| **task** | Individual card task. |
| **board_user** | *M-N* join to share boards with teammates (role per board). |
</details>

## Technologies

- **Frontend**
  - **React 18** – declarative UI library with Hooks and a mature ecosystem
  - **Vite 6** – lightning-fast dev server & production builds
  - **TypeScript 5** – static typing and first-class IDE support

- **Backend**
  - **NestJS 10** – modular, testable Node.js framework (controllers, services, DI)
  - **TypeORM** – object–relational mapper for PostgreSQL; entities, migrations, query builder

- **Database**
  - **PostgreSQL 15** – battle-hardened relational database with rich JSONB and indexing


## Setup

**Prerequisites**
* Node.js 18 LTS or newer
* npm (comes with Node.js)
* Docker Desktop (for PostgreSQL database)

---

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/<your-org>/<repo>.git
cd task-management-app
```

2. **Install Backend Dependencies**
```bash
cd nestjs
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../reactvite
npm install
```

### Running the Application

**Start Backend (Terminal 1):**
```bash
cd nestjs
npm run start:dev
```
Backend runs on: http://localhost:3000/api

**Start Frontend (Terminal 2):**
```bash
cd reactvite
npm run dev
```
Frontend runs on: http://localhost:5173

### Available Scripts

**Backend (nestjs):**
```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run start:prod   # Run production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Frontend (reactvite):**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

