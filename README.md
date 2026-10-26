
# DT Vehicles Management

A vehicle management system with a **React** frontend and **Node.js/Express** backend.

## Screenshots

![Dashboard](2.png)

![Vehicle Management](3.png)

## Table of Contents

* [Overview](#overview)
* [Key Highlights](#key-highlights)
* [Installation](#installation)
* [Access](#access)
* [Features](#features)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Configuration](#configuration)
* [Running the Application](#running-the-application)
* [Deployment](#deployment)
* [API Documentation](#api-documentation)
* [Contributing](#contributing)
* [Testing](#testing)
* [Performance](#performance)
* [Troubleshooting](#troubleshooting)
* [License](#license)
* [Authors](#authors)
* [Acknowledgments](#acknowledgments)
* [Support](#support)

## Overview

The **DT Vehicles Management System** is a modern web application designed to streamline vehicle fleet operations for Deep Tec Engineering. It provides tools for vehicle tracking, maintenance scheduling, insurance management, license renewal tracking, notifications, and reporting.

## Key Highlights

| Feature                | Description                           | Status   |
| ---------------------- | ------------------------------------- | -------- |
| 🚗 Fleet Management    | Complete vehicle lifecycle management | ✅ Active |
| 📊 Real-time Dashboard | Live statistics and alerts            | ✅ Active |
| 🔔 Smart Notifications | Automated expiry alerts               | ✅ Active |
| 📄 PDF Reports         | Comprehensive reporting system        | ✅ Active |
| 📱 Mobile Responsive   | Works on all device sizes             | ✅ Active |
| 🔐 Secure & Scalable   | Built with security best practices    | ✅ Active |

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/Dill1027/DT_Vehicles_Management.git
cd DT_Vehicles_Management
```

2. **Install dependencies**

```bash
# Root (optional)
npm install

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

> Or use convenience scripts if defined:
>
> ```bash
> npm run install:all
> ```

## Access

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:5002](http://localhost:5002)

## Features

### 🚙 Vehicle Management

* **Vehicle Registration:** Add vehicles with detailed specs
* **Vehicle Profiles:** Make, model, year, type, department
* **Status Tracking:** Availability, usage, maintenance status
* **Document Management:** Upload/manage images and PDFs
* **Search & Filter:** Quickly find vehicles
* **PDF Reports:** Export data

### 📊 Dashboard & Analytics

* Real-time statistics and status overview
* Expiry alerts (insurance, license)
* Quick actions and charts (Recharts)

### 🔔 Notification System

* Insurance and license renewal alerts
* Maintenance reminders
* Custom notification parameters

### 📄 Reporting & Export

* jsPDF-based PDF reports
* Data export and print-friendly layouts

### 🏢 Department Management

* Multi-department support (Engineering, Operations, Admin, Sales, Maintenance, Executive)
* Role-based access and vehicle assignment

## Technology Stack

### Frontend

* React 18
* React Router v6
* Tailwind CSS
* React Query
* React Hook Form
* Heroicons / Lucide React
* React Hot Toast
* jsPDF & AutoTable
* Recharts
* Axios

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT + bcryptjs
* Multer
* Helmet
* CORS
* Express Rate Limit
* Nodemailer
* PDFKit

### Development Tools

* Concurrently
* Nodemon
* React Scripts
* ESLint

## Project Structure

```
DT_Vehicles_Management/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── Navigation.js
│   │   │   ├── VehicleCard.js
│   │   │   ├── VehicleModal.js
│   │   │   └── LoadingSpinner.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Vehicles.js
│   │   │   ├── AddVehicle.js
│   │   │   ├── EditVehicle.js
│   │   │   ├── VehicleDetail.js
│   │   │   └── Reports.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── vehicleService.js
│   │   │   ├── notificationService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── performanceMonitor.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── build/
│   ├── package.json
│   └── tailwind.config.js
├── server/
│   ├── controllers/
│   │   └── vehicleController.js
│   ├── middleware/
│   │   ├── corsMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Vehicle.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── vehicleRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   └── notificationService.js
│   ├── scripts/
│   │   ├── seedMongoDB.js
│   │   ├── createDefaultAdmin.js
│   │   └── clearDatabase.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── email.js
│   │   └── pdfGenerator.js
│   ├── server.js
│   ├── dev-server.js
│   └── package.json
├── package.json
├── vercel.json
├── deploy.sh
└── README.md
```

## Prerequisites

* Node.js ≥ 16
* npm ≥ 8
* MongoDB Atlas or a local replica set (transactions required)
* Git

## Configuration

### Backend Environment (`server/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/dt_vehicles_management
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles_management

PORT=5002
NODE_ENV=development

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Frontend Environment (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_ENV=development
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

## Running the Application

### Development Mode

```bash
# Start both (if script exists)
npm run dev
```

This starts:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:5002](http://localhost:5002)

Run individually:

```bash
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm start
```

### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start production server (adjust if using PM2)
cd ../server
npm start
```

## Deployment

### Vercel (Recommended)

* Connect the GitHub repository in Vercel
* Set environment variables in Vercel dashboard
* The project reads configuration from `vercel.json`

Manual example:

```bash
# Backend
cd server
./deploy-backend.sh

# Frontend
cd ../client
./deploy-frontend.sh
```

### Production Environment Variables

**Backend:** `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
**Frontend:** `REACT_APP_API_URL`, `REACT_APP_ENV=production`

## API Documentation

Base URLs:

* Development: `http://localhost:5002/api`
* Production: `https://your-backend-url.example.com/api`

### Authentication

Sign in with `POST /api/auth/login` using `{ "email": "...", "password": "..." }`.
The response sets an HTTP-only session cookie. Browser clients must enable
credentials (`withCredentials: true` in Axios); command-line clients can use a
cookie jar. `GET /api/auth/me` returns the signed-in profile.

### Vehicle Endpoints

```http
GET /api/vehicles
GET /api/vehicles/:id
POST /api/vehicles
PUT /api/vehicles/:id
DELETE /api/vehicles/:id  # Archives the vehicle
PATCH /api/vehicles/:id/archive
PATCH /api/vehicles/:id/restore
```

Example payload:

```json
{
  "vehicleNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "type": "Car",
  "department": "Engineering"
}
```

### Notification Endpoints

```http
GET /api/notifications
POST /api/notifications
PATCH /api/notifications/:id/read
```

## Contributing

1. Fork the repository
2. Create a feature branch:

   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make changes and run tests
4. Commit with a meaningful message
5. Push and open a Pull Request

Code style: use ESLint, follow React best practices, and comment complex logic.

## Testing

```bash
# Frontend
cd client && npm test

# Backend
cd server && npm test

# Optional
npm run test:integration
npm run test:e2e
```

Run with coverage:

```bash
npm test -- --coverage
```

## Performance

**Targets**

| Metric                   | Target |
| ------------------------ | ------ |
| First Contentful Paint   | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive      | < 3.0s |
| Cumulative Layout Shift  | < 0.1  |

**Optimizations**

* Code splitting, tree shaking, minification
* React Query caching and pagination
* Image optimization and lazy loading
* MongoDB indexing and optimized queries
* Gzip compression and rate limiting

Bundle analysis:

```bash
npm run analyze:bundle
```

## Troubleshooting

### CORS

1. Ensure backend runs on the expected port
2. Verify `REACT_APP_API_URL`
3. Check CORS config in `server/server.js`

### Atlas DNS connection errors

If Atlas reports `querySrv ECONNREFUSED` or `ETIMEOUT`, configure resolvers for
this backend process in `server/.env` and restart the backend:

```env
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
```

Leave this variable unset to use system DNS. This does not change macOS network
settings. `read ECONNRESET` can also indicate a network interruption or blocked
Atlas traffic; check connectivity and the Atlas project network access list if it persists.

### Database

1. MongoDB service running
2. Valid `MONGODB_URI`
3. Correct credentials

### Port Conflicts

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5002 | xargs kill -9
```

### Build Issues

```bash
npm run clean
npm run install:all
```

## License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for details.

## Authors

* **Deep Tec Engineering Team** — Initial work
* **Your Name** — Development

## Acknowledgments

* Deep Tec Engineering
* React Team
* MongoDB Team
* Vercel Team
* Tailwind CSS
* Heroicons / Lucide React
* React Query
* jsPDF
* React Hot Toast
* Community contributors and beta testers

## Support

* Issues: [GitHub Issues](https://github.com/Dill1027/DT_Vehicles_Management/issues)
* Discussions: [GitHub Discussions](https://github.com/Dill1027/DT_Vehicles_Management/discussions)
* Documentation: Project Wiki (if available)
* Email: [development@deeptec.com](mailto:development@deeptec.com)

---

<div align="center">

**Built with ❤️ for Deep Tec Engineering**
*Empowering efficient vehicle fleet management through modern technology*

Last updated: October 2025

[![GitHub stars](https://img.shields.io/github/stars/Dill1027/DT_Vehicles_Management?style=social)](https://github.com/Dill1027/DT_Vehicles_Management)
[![GitHub forks](https://img.shields.io/github/forks/Dill1027/DT_Vehicles_Management?style=social)](https://github.com/Dill1027/DT_Vehicles_Management/fork)
[![GitHub issues](https://img.shields.io/github/issues/Dill1027/DT_Vehicles_Management)](https://github.com/Dill1027/DT_Vehicles_Management/issues)

</div>


## Accounts, permissions and archive

Every fleet API and document/photo endpoint requires a signed-in account. Sessions
use an HTTP-only cookie; passwords are stored as bcrypt hashes. Profile changes
never allow users to change their own role. Role changes and user deletion revoke
existing sessions.

| Role | View / reports / profile | Add / edit vehicles | Archive / restore | Manage users |
| --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes |
| Editor | Yes | Yes | No | No |
| Viewer | Yes | No | No | No |

Set `JWT_SECRET` (a long random value), `BOOTSTRAP_ADMIN_EMAIL`, and
`BOOTSTRAP_ADMIN_PASSWORD` in the ignored `server/.env.local` file. Startup creates
an administrator only when the users collection is empty. Existing users and
passwords are never reset on restart. Use `npm run create-admin` in `server` to
run this setup explicitly. Set `FRONTEND_URL` to the exact frontend origin when
hosting a different frontend domain; production cookies require HTTPS. For browser
compatibility, serve the frontend and proxy `/api` and `/uploads` through the same
origin rather than relying on cross-site cookies.

Vehicles are archived instead of permanently deleted. Admins can access Archive
and restore records. Active lists, statistics and fleet reports exclude archived
records; vehicle numbers remain reserved so history stays attached to the vehicle.

### Thumbnails

Card photos use persisted JPEG thumbnails up to 640px instead of full originals.
New image uploads create a thumbnail, and legacy photos are converted on first
use. Originals are preserved for the detail gallery. Run `npm run thumbnails` in
`server` to backfill existing records. The converter uses Sharp when available,
and macOS provides an additional native `sips` converter (including HEIC).
On Linux hosting, install Sharp before uploading images; HEIC input requires a
Sharp/libvips build with HEIF support or conversion to JPEG before upload.

Run backend checks with `cd server && npm test` and frontend checks with
`cd client && CI=true npm test -- --watchAll=false --runInBand`.


## Service history, fuel tracking and activity

Open a vehicle and use **Maintenance** for service/repair entries and **Fuel** for
fuel fills. Admins and Editors can add/edit entries; Viewers can read them and
download receipts. Only Admins can remove entries. Removal voids the entry and
excludes it from totals while preserving its underlying history. Archived vehicles
are read-only until restored.

Service entries include date, category, work completed, garage/provider, odometer,
LKR cost, next-service recommendations and notes. Fuel entries include date,
odometer, litres, LKR cost, station and a full-tank flag. Bills can be PDF, JPEG,
PNG or WebP up to 5MB. Receipt contents are served separately after authentication
and never included in list responses or activity entries.

Fuel efficiency uses complete full-tank intervals: all partial fills after the
previous full tank are included. The first full tank establishes the baseline;
its initial litres are not counted as fuel consumed in the next interval. Monthly
costs follow the recorded date and Sri Lanka calendar month. Vehicle-profile
schedule fields remain separate from recommendations on individual service entries.

Admins can open **Activity** or the vehicle's Activity link to filter changes by
vehicle, action and Sri Lanka date range. Entries retain actor names/emails and
before/after values for allowlisted fields, even after accounts are removed.
Passwords, password hashes, photos and receipt contents are not recorded. The
activity API is read-only. Historical events before this feature are not invented
or backfilled.

Vehicle mutations, user administration/profile changes and service/fuel writes
commit together with their activity entries in MongoDB transactions. MongoDB must
be a replica set (Atlas already is); a standalone `mongod` cannot support these
transactional writes. Fuel writes serialize per vehicle to validate odometer order
and prevent concurrent duplicate fills. New-entry forms also use request IDs so
a retry after a timeout cannot create a second expense or duplicate activity entry.

Authenticated API routes:

```http
GET /api/operations/:vehicleId?kind=service&page=1
GET /api/operations/:vehicleId?kind=fuel&page=1
POST /api/operations/:vehicleId/:kind
PATCH /api/operations/:vehicleId/:kind/:recordId
DELETE /api/operations/:vehicleId/:kind/:recordId
GET /api/operations/:vehicleId/:kind/:recordId/receipt
GET /api/activity?action=fuel.updated&from=2026-01-01&to=2026-12-31&page=1
```

For new-entry POST requests, an optional UUID `requestId` enables safe retries;
reuse it only with the same payload. Use PATCH to edit an existing record.

Here `kind` is `service` or `fuel`. Records paginate in groups of 20 and activity
in groups of 25. The activity endpoint is Admin-only.
