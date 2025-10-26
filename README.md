# MERN Blog — Week 4 Integration

This repository implements a minimal MERN blog application for the Week 4 assignment. It contains a Node/Express/Mongoose backend and a Vite + React client. The project demonstrates basic CRUD for posts and categories, user authentication (register/login with JWT), comments, search, and a small React front-end that consumes the API.

## What I implemented
- Server
  - Models: `Post`, `Category`, `User` (password hashing + helper methods)
  - Routes: posts (CRUD, pagination, search, comments), categories (list + create), auth (register/login)
  - Middleware: JWT auth middleware to protect routes
  - Error handler and static `uploads` serving wired in `server/server.js`
- Client
  - Vite + React scaffold
  - `client/src/services/api.js` (existing) used to call API endpoints
  - Pages/components: `Home` (post list), `PostPage` (single post), `CreatePost` (create/edit)
  - A small reusable `useApi` hook to handle loading/errors

Files you may want to inspect first:
- `server/server.js`
- `server/models/Post.js`, `server/models/Category.js`, `server/models/User.js`
- `server/routes/posts.js`, `server/routes/categories.js`, `server/routes/auth.js`
- `client/src/App.jsx`, `client/src/pages/*`, `client/src/services/api.js`

## Quick start (development)
Prerequisites: Node.js (v18+), MongoDB.

1. Server

```powershell
cd server
npm install
# Create a .env file (copy .env.example)
# Edit MONGODB_URI and JWT_SECRET as appropriate
npm run dev
```

2. Client

```powershell
cd client
npm install
# Copy client/.env.example to client/.env if you need to change API URL
npm run dev
```

By default the client expects the API at `http://localhost:5000/api`. Adjust `client/.env` / Vite env var `VITE_API_URL` if needed.

## Environment variables
- `server/.env.example` contains the variables used by the server:
  - `MONGODB_URI` — MongoDB connection string
  - `JWT_SECRET` — secret for signing JWTs
  - `PORT` — server port

- `client/.env.example`:
  - `VITE_API_URL` — base API URL (default: `http://localhost:5000/api`)

## API (summary)
All server endpoints are prefixed with `/api` (server mounts routes as `/api/posts`, `/api/categories`, `/api/auth`).

Auth
- POST /api/auth/register
  - Body: { name, email, password }
  - Response: { user, token }
- POST /api/auth/login
  - Body: { email, password }
  - Response: { user, token }

Categories
- GET /api/categories
  - Response: [ { _id, name, slug, ... } ]
- POST /api/categories (protected)
  - Headers: Authorization: Bearer <token>
  - Body: { name, description }

Posts
- GET /api/posts?page=1&limit=10&category=<slugOrId>
  - Response: { posts: [...], page, limit, total }
- GET /api/posts/:idOrSlug
  - Response: post object
- POST /api/posts (protected)
  - Headers: Authorization: Bearer <token>
  - Body: { title, content, category (id or slug), excerpt, tags, featuredImage, isPublished }
- PUT /api/posts/:id (protected, author or admin)
  - Update fields
- DELETE /api/posts/:id (protected, author or admin)
- POST /api/posts/:id/comments (protected)
  - Body: { content }
- GET /api/posts/search?q=term

Notes:
- The server issues JWTs on login/register. The client `api.js` adds the token from localStorage automatically.
- Post model includes a text index for simple search on title/content/excerpt.

## What’s missing / next steps (suggested)
- Add more robust validation and consistent error response structure for all endpoints.
- Add integration tests for server endpoints (supertest + jest/mocha).
- Implement image upload handling (multer) and client upload UI.
- Implement user profile pages and protected client routes (login UI currently not implemented in the client pages).

## Verification plan (manual smoke test)
1. Start MongoDB locally.
2. Start server (`cd server && npm run dev`).
3. Register a user via POST /api/auth/register (use Postman or curl).
4. Create a category (use the token returned by register/login).
5. Create a post referencing the category.
6. Open the client app and verify the post list and single-post pages.

## Where I made changes
- Server: added models and routes under `server/models` and `server/routes`, added `server/package.json`, and `server/.env.example`.
- Client: scaffolded a minimal Vite React app under `client/` with pages and a small stylesheet; used the existing `client/src/services/api.js` for API calls.

---
If you want, I can now:
- run `npm install` and start both the server and client here and run the smoke tests automatically, or
- add automated tests, or
- implement file uploads and the login UI.

Tell me which of those I should do next and I'll proceed.
# MERN Stack Integration Assignment

This assignment focuses on building a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that demonstrates seamless integration between front-end and back-end components.

## Assignment Overview

You will build a blog application with the following features:
1. RESTful API with Express.js and MongoDB
2. React front-end with component architecture
3. Full CRUD functionality for blog posts
4. User authentication and authorization
5. Advanced features like image uploads and comments

## Project Structure

```
mern-blog/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── context/        # React context providers
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Express.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week4-Assignment.md` file
4. Complete the tasks outlined in the assignment

## Files Included

- `Week4-Assignment.md`: Detailed assignment instructions
- Starter code for both client and server:
  - Basic project structure
  - Configuration files
  - Sample models and components

## Requirements

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn
- Git

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete both the client and server portions of the application
2. Implement all required API endpoints
3. Create the necessary React components and hooks
4. Document your API and setup process in the README.md
5. Include screenshots of your working application

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/) 