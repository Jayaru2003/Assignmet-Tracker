# 📚 Student Assignment Tracker

A full-stack web application built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **EJS** following the **MVC architecture**.

---

## 🚀 Features

- **Add Assignments** — title, subject, deadline, status
- **Dashboard** — view all assignments sorted by deadline
- **Mark Complete** — toggle assignment status with one click
- **Delete** — remove assignments permanently
- **Overdue Highlighting** — overdue tasks are visually flagged in red 🔥
- **Smart Filtering** — filter by All / Pending / Completed
- **Live Statistics** — total, completed, pending, and overdue counts

---

## 📁 Project Structure

```
assighnment tracker/
├── app.js                    # Express entry point
├── .env                      # Environment variables (MongoDB URI, PORT)
├── .gitignore
├── package.json
├── models/
│   └── Assignment.js         # Mongoose schema & model
├── controllers/
│   └── assignmentController.js  # CRUD logic, stats, filtering
├── routes/
│   └── assignmentRoutes.js   # RESTful route definitions
└── views/
    └── dashboard.ejs         # EJS template — full dashboard UI
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

Edit `.env` (already created for you):

```
MONGO_URI=mongodb://127.0.0.1:27017/assignment_tracker
PORT=3000
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

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/assignments` | Dashboard — list all assignments |
| GET | `/assignments?filter=pending` | Filter by pending status |
| GET | `/assignments?filter=completed` | Filter by completed status |
| POST | `/assignments` | Create a new assignment |
| PUT | `/assignments/:id` | Update assignment status |
| DELETE | `/assignments/:id` | Delete an assignment |

---

## 🏗️ MVC Architecture

| Layer | File | Responsibility |
|-------|------|---------------|
| **Model** | `models/Assignment.js` | Schema, validation, virtual `isOverdue` |
| **View** | `views/dashboard.ejs` | EJS template — renders the dashboard UI |
| **Controller** | `controllers/assignmentController.js` | Business logic, CRUD, stats, filtering |
| **Routes** | `routes/assignmentRoutes.js` | RESTful route wiring |

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
| method-override | PUT/DELETE from HTML forms |
| dotenv | Environment variables |
