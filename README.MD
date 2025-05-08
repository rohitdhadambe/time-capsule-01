# Time Capsule API

A RESTful API service that allows users to create digital time capsules - messages that can only be accessed after a specific unlock date.

## Features

- **User Authentication**: Register and login users with JWT token-based authentication
- **Create Time Capsules**: Store messages with a future unlock date
- **Unlock Protection**: Capsules require a secret unlock code to access
- **Time Restrictions**: Capsules can only be accessed after their unlock date
- **Expiration**: Capsules expire 30 days after their unlock date
- **Update & Delete**: Capsules can be modified or deleted before unlock time
- **Pagination**: List user capsules with pagination support
- **Background Cleanup**: Automatic marking of expired capsules

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest and Supertest
- **Background Tasks**: node-cron

## API Endpoints

### Authentication

- **POST /auth/register** - Register a new user
- **POST /auth/login** - Login and get JWT token

### Capsules

- **POST /capsules** - Create a new time capsule
- **GET /capsules** - List all user capsules (with pagination)
- **GET /capsules/:id** - Retrieve a specific capsule (if unlockable and with valid code)
- **PUT /capsules/:id** - Update a capsule (if not yet unlockable and with valid code)
- **DELETE /capsules/:id** - Delete a capsule (if not yet unlockable and with valid code)

## Project Structure

```
time-capsule-api/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middlewares/  # Express middlewares
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── app.js        # Express app setup
├── tests/            # Test files
├── .env.example      # Example environment variables
├── .gitignore        # Git ignore configuration
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/time-capsule-api.git
cd time-capsule-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
npm run dev
```

### Running Tests

```bash
npm test
```

## Capsule Lifecycle

1. **Creation**: User creates a capsule with a message and future unlock date
2. **Before Unlock**: Capsule can be updated or deleted with the unlock code
3. **Unlockable**: After unlock date, capsule can be accessed with the unlock code
4. **Expired**: 30 days after unlock date, capsule is marked as expired and returns 410 Gone

## Development Decisions & Tradeoffs

### Security
- Unlock codes are stored hashed in the database
- JWT tokens are used for user authentication
- All capsule operations require proper authentication

### Performance
- Pagination is implemented for capsule listing
- Expired capsules are marked in the database to avoid rechecking
- Background job handles expiration checks

### Maintainability
- Clean separation of concerns with controllers, services, and models
- Comprehensive test suite for all major functionality
- RESTful API design with standard status codes

## Future Improvements

- **Email Notifications**: Send notifications when capsules become unlockable
- **Rate Limiting**: Implement API rate limiting for security
- **Shared Capsules**: Allow sharing capsules with specific users
- **Content Types**: Support for different types of content (images, files, etc.)
- **Public Capsules**: Option to make capsules publicly accessible

## Git Workflow Strategy

For this project, we've used a single merge strategy:
1. Work on a feature branch (e.g., `feature/create-capsule-api`)
2. Open a pull request for review
3. Use squash merges to keep Git history clean and readable


## License
This project is licensed under the MIT License.