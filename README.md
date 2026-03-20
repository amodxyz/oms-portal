# Order Management System (OMS)

A comprehensive, modular Order Management System with role-based access control.

## Features

- **Items Module**: Manage inventory, stock, categories, BOM, raw materials
- **Sales Module**: Orders, invoices, customers, analytics
- **Purchasing Module**: Suppliers, purchase orders
- **Production Module**: Workflows, scheduling, resource allocation
- **Quality Control**: Inspections and reports
- **Logistics**: Transporters, dispatches, tracking
- **Reports**: Inventory, day book, analytics
- **Verifications, Integrations, Settings, Profile**

## Tech Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT with RBAC

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Configure environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Update database credentials and JWT secret

3. Setup database:
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

4. Run development server:
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## Default Credentials

- Admin: admin@oms.com / admin123
- Manager: manager@oms.com / manager123
- Staff: staff@oms.com / staff123

## Project Structure

```
oms-portal/
├── client/          # React frontend
├── server/          # Express backend
└── package.json     # Root package manager
```
