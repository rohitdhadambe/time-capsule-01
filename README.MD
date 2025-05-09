# 📦 Time Capsule API

A RESTful API for creating and managing digital time capsules—messages securely stored and accessible only after a specified unlock date.

---

## 🚀 Deployment 
- **Base**: https://time-capsule-47ba.onrender.com/(CREATEDENDPOINTS) >>>> CAN BE CHECK ON POSTMAN OR ON THUNDER
- **Health Endpoint** [Check Health](https://time-capsule-47ba.onrender.com/health)

---

## 🚀 Features

* **Secure User Authentication**: Register/login with JWT-based tokens
* **Time Capsule Creation**: Store messages to be unlocked in the future
* **Access Control**: Capsules protected by secret unlock codes
* **Unlock Date Enforcement**: Capsules are only accessible after the unlock time
* **Expiration Policy**: Capsules expire 30 days post-unlock
* **Capsule Management**: Update or delete before unlock
* **Pagination Support**: Paginated capsule listing for efficient access
* **Automated Cleanup**: Background task for marking expired capsules

---

## 🧰 Tech Stack

* **Backend**: Node.js + Express
* **Database**: PostgreSQL
* **Authentication**: JWT (JSON Web Tokens)
* **Testing**: Thunder + Postman
* **Scheduler**: node-cron for background tasks

---

## 🔗 API Endpoints

### 🧑 Authentication

* `POST /auth/register` — Register a new user
* `POST /auth/login` — Log in and receive a JWT token

### 📦 Capsules

* `POST /capsules` — Create a time capsule
* `GET /capsules` — Get list of user's capsules (paginated)
* `GET /capsules/:id` — Get capsule (if unlockable with correct code)
* `PUT /capsules/:id` — Update a capsule (only before unlock, with valid code)
* `DELETE /capsules/:id` — Delete a capsule (only before unlock, with valid code)

---

## 🏗️ Project Structure

```
Backend/
├── node_modules/     # Project dependencies
├── src/              # Source files
│ ├── config/         # Configuration files (e.g., DB, environment)
│ ├── controllers/    # Controller logic for handling requests
│ ├── middlewares/    # Middleware functions for request processing
│ ├── models/         # Mongoose or Sequelize models
│ ├── routes/         # Route definitions
│ ├── services/       # Business logic/services
│ └── app.js          # App entry point
├── test/             # Automated test cases
│ ├── auth.test.js
│ └── capsule.test.js
├── utils/            # Utility/helper functions
│ └── generateCode.js
├── .env              # Environment-specific variables (not committed)
├── .env.example      # Sample env file
├── .gitignore        # Git ignore rules
├── package.json      # Project metadata and scripts
├── pnpm-lock.yaml    # Lock file for pnpm package manager
├── req.json          # Sample API request/response schema
├── API TESTING AND DATABASE INTEGRATION.pdf # Documentation
└── README.md         # Project overview

---

## 🧪 Getting Started

### ✅ Prerequisites

* Node.js (v14+)
* PostgreSQL

### ⚙️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/time-capsule-api.git
cd time-capsule-api
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit the .env file to match your setup (DB credentials, secret keys, etc.)
```

4. **Run the server**

```bash
pnpm run dev
```

### 🧪 Running Tests

```bash
pnpm test
```

---

## 🔄 Capsule Lifecycle

1. **Created** — User submits a message and unlock date
2. **Pending Unlock** — Capsule is locked, editable/deletable with code
3. **Unlocked** — After unlock date, accessible with unlock code
4. **Expired** — 30 days post-unlock, capsule returns `410 Gone`

---

## 🧠 Design Decisions & Tradeoffs

### 🔐 Security

* Unlock codes are hashed using bcrypt before storing
* JWT-based auth protects all user and capsule operations
* Access checks ensure capsules are only viewed/modified appropriately

### ⚡ Performance

* Capsule list paginated to avoid overloading responses
* Expired capsules are marked to reduce unnecessary checks
* Background task (via `node-cron`) handles expiry automation

### 🧹 Maintainability

* Clear separation of logic via MVC structure
* Test suite covers endpoints and logic thoroughly
* Standardized API with consistent HTTP status codes


