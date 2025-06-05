# Task-Board – full-stack task-management app

A Trello-style board that lets teams organise work into **Boards → Task Groups → Tasks** with drag-and-drop ordering.

* **Backend** – NestJS 10 + TypeORM (PostgreSQL)  
* **Frontend** – React 18 + Vite  
* **Messaging** – RabbitMQ for async jobs (e-mail / notifications)

## Key features

Authentication: JWT (access + refresh) in HttpOnly cookies; refresh-token rotation; role guards (`admin`, `user`).  
Task workflow: CRUD for boards, groups and tasks; order preserved via `order` integer column.  
Async jobs: RabbitMQ publisher / consumer keeps HTTP requests fast.  
REST API: Prefixed with **`/api`**, Swagger docs at `/api/docs`.  
Database: PostgreSQL schema in 3-NF, entities & migrations handled by TypeORM.

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

## 🛠 Technologies

- Frontend
  - React 18
    - Declarative UI library
    - Mature ecosystem, Hooks API and excellent TypeScript support, popular on market
  - Vite
    - Lightning-fast dev server and builds, fast production
- Backend
  - NestJS 10
    - NestJS provides a clean, modular architecture
    - Primary HTTP server framework
  - TypeORM
    - Object-Relational Mapping for PostgreSQL.
    - Entity-first approach, automatic migrations, integrates seamlessly with NestJS.
  - Jest
    - Unit + e2e testing.
    - Fast, snapshot-friendly and ships with NestJS starter kits.
- Database
  - PostgreSQL
    - Primary relational database.
    - Stable, relational store with strong JSON & indexing capabilities.
- Other
  - RabbitMQ 3
    - Message broker for background tasks.
    - Simple, durable work-queue semantics and handy management UI.

