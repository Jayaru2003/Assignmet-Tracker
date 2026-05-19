# 📚 Student Assignment Tracker

A full-stack web app built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **EJS** using the **MVC architecture**. It includes **JWT authentication**, user-scoped assignments, and a JSON API.

---

## 🚀 Features

- **User Auth** — register, login, logout (JWT stored in HTTP-only cookie)
- **User Isolation** — each account only sees its own assignments
- **Add Assignments** — title, subject, deadline, status
- **Dashboard** — view assignments sorted by deadline
- **Search** — title or subject
- **Smart Filtering** — all / pending / completed / overdue
- **Mark Complete** — toggle assignment status with one click
- **Delete** — remove assignments permanently
- **Overdue Highlighting** — overdue tasks are flagged in red 🔥
- **Live Statistics** — total, completed, pending, and overdue counts
- **REST API** — JSON endpoints for CRUD operations

---

## 📁 Project Structure

```
Assignmet-Tracker/
├── app.js                       # Express entry point
├── .env                         # Environment variables (ignored)
├── .gitignore
├── package.json
├── models/
│   ├── Assignment.js            # Assignment schema
│   └── User.js                  # User schema (auth)
├── controllers/
│   ├── assignmentController.js  # Dashboard CRUD + stats
│   ├── authController.js        # Register/login/logout
│   └── apiController.js         # JSON API handlers
├── routes/
│   ├── assignmentRoutes.js      # Protected web routes
│   ├── authRoutes.js            # Auth routes
│   └── apiRoutes.js             # REST API routes
├── middleware/
│   └── auth.js                  # JWT protect/redirect middleware
└── views/
    ├── dashboard.ejs            # Dashboard UI
    ├── login.ejs                # Login page
    └── register.ejs             # Register page
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a MongoDB Atlas URI

---

## 🛠️ Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root (this file is ignored by git):

```
MONGO_URI=mongodb://127.0.0.1:27017/assignment_tracker
PORT=3000
JWT_SECRET=your_long_random_secret
```

> **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string.

### 3. Start MongoDB locally

Make sure your local MongoDB service is running:

```bash
# Windows (run in a separate terminal)
mongod
```

### 4. Start the app

```bash
npm start
```

Open your browser at **http://localhost:3000** 🎉

---

## 🔐 Authentication

- Register at `/auth/register`, then login at `/auth/login`.
- After login, a JWT is stored in an HTTP-only cookie named `token`.
- All `/assignments` and `/api/assignments` routes require this cookie.
- Logout via `/auth/logout`.

---

## 🌐 API Endpoints

### Web Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/assignments` | Dashboard — list assignments |
| GET | `/assignments?filter=pending` | Filter pending |
| GET | `/assignments?filter=completed` | Filter completed |
| GET | `/assignments?filter=overdue` | Filter overdue |
| GET | `/assignments?search=math` | Search by title/subject |
| POST | `/assignments` | Create a new assignment |
| PUT | `/assignments/:id` | Update assignment status |
| DELETE | `/assignments/:id` | Delete an assignment |

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/register` | Registration page |
| POST | `/auth/register` | Create user |
| GET | `/auth/login` | Login page |
| POST | `/auth/login` | Authenticate user |
| GET | `/auth/logout` | Logout and clear cookie |

### JSON API

All API routes require authentication via the `token` cookie (set after login).

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/assignments` | List assignments (supports filter/search) |
| POST | `/api/assignments` | Create an assignment |
| PUT | `/api/assignments/:id` | Update assignment status |
| DELETE | `/api/assignments/:id` | Delete an assignment |

---

## 🏗️ MVC Architecture

| Layer | File | Responsibility |
|-------|------|---------------|
| **Model** | `models/Assignment.js`, `models/User.js` | Schemas, validation, auth |
| **View** | `views/*.ejs` | EJS templates for login/register/dashboard |
| **Controller** | `controllers/*Controller.js` | CRUD, auth, API |
| **Routes** | `routes/*.js` | Web + API route wiring |

---

## 🎨 UI Highlights

- Modern dark theme with vibrant accent colours
- Animated assignment cards with overdue 🔥 indicators
- Responsive two-column layout (form + list)
- One-click status toggle (circle checkbox)
- Stats bar showing live counts
- Filter tabs to narrow the list

---

## 📝 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | ODM for MongoDB |
| EJS | Server-side templating |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| cookie-parser | Read auth cookies |
| method-override | PUT/DELETE from HTML forms |
| dotenv | Environment variables |
