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
