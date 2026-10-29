# sample-nest

A NestJS learning project with user registration and JWT authentication, backed by MongoDB (Mongoose).

## Tech stack

- [NestJS](https://nestjs.com/) (Express platform)
- MongoDB with `@nestjs/mongoose`
- JWT auth with `@nestjs/jwt` and `bcrypt` password hashing
- Request validation with `class-validator` (global `ValidationPipe`)
- Config via `@nestjs/config` (`.env`)
- Tests with Vitest, linting with oxlint, formatting with Prettier

## Prerequisites

- Node.js 22+
- MongoDB running locally, or Docker (see below)

## Getting started

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Create a .env file in the project root
cp .env.example .env   # or create it by hand (see below)

# 3. Start MongoDB (see "Running MongoDB with Docker")

# 4. Start the app in watch mode
npm run start:dev
```

The server listens on `http://localhost:3000` (override with `PORT`).

> `--legacy-peer-deps` works around an npm peer-dependency resolver bug seen with this dependency set.

### Environment variables

| Variable      | Description                          | Example                                  |
| ------------- | ------------------------------------ | ---------------------------------------- |
| `MONGODB_URL` | MongoDB connection string            | `mongodb://localhost:27017/nest-sample`  |
| `JWT_SECRET`  | Secret used to sign JWT access tokens | a long random string                     |
| `PORT`        | Optional HTTP port (default `3000`)  | `3000`                                   |

Never commit `.env`. If MongoDB has authentication enabled, include credentials:
`mongodb://root:example@localhost:27017/nest-sample?authSource=admin`.

### Running MongoDB with Docker

Put this in `compose.yaml`:

```yaml
services:
  mongo:
    image: mongo:8
    container_name: sample-nest-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
docker compose up -d      # start
docker compose logs -f    # logs
docker compose down       # stop (data is kept)
docker compose down -v    # stop and delete data
```

You can then inspect the data with MongoDB Compass using the same `MONGODB_URL`.

## API

### `POST /auth/register`

Creates a user and returns a JWT access token (expires in 60 seconds).

Request body:

```json
{
  "fname": "Ada",
  "lname": "Lovelace",
  "email": "ada@example.com",
  "password": "s3cret"
}
```

Response `201`:

```json
{ "access_token": "<jwt>" }
```

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| `201`  | User created                                 |
| `400`  | Validation failed (missing field, bad email) |
| `409`  | Email is already registered                  |

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fname":"Ada","lname":"Lovelace","email":"ada@example.com","password":"s3cret"}'
```

## Project structure

```
src/
├── main.ts                  # Bootstrap, global ValidationPipe
├── app.module.ts            # Root module (Config, Mongoose, Auth, User)
├── auth/
│   ├── auth.controller.ts   # /auth routes
│   ├── auth.service.ts      # Hashing + JWT creation
│   ├── auth.module.ts       # JwtModule configuration
│   └── dto/                 # Request DTOs
└── user/
    ├── user.service.ts      # Database access for users
    ├── user.module.ts
    ├── user.types.ts        # Role enum
    └── schemas/user.schema.ts
test/                        # e2e tests
```

## Architecture notes

General request flow:

```
user -> middleware -> routes -> controllers -> services -> database
```

Current flow in this project:

```
app module -> auth module -> auth controller -> auth service -> user service -> database
```

A **DTO** (Data Transfer Object) describes the shape of data sent between layers, for example the request body of `/auth/register`. Validation rules live on the DTO with `class-validator` decorators.

## Scripts

| Command               | What it does                     |
| --------------------- | -------------------------------- |
| `npm run start:dev`   | Run with file watching           |
| `npm run build`       | Compile to `dist/`               |
| `npm run start:prod`  | Run the compiled build           |
| `npm test`            | Unit tests (Vitest)              |
| `npm run test:e2e`    | End-to-end tests                 |
| `npm run test:cov`    | Tests with coverage              |
| `npm run lint`        | Lint with oxlint                 |
| `npm run format`      | Format with Prettier             |

## Troubleshooting

- **`Cannot find type definition file for 'node'`**: dependencies aren't installed; run `npm install --legacy-peer-deps`.
- **`uri parameter must be a string`**: `MONGODB_URL` is missing or misspelled in `.env`.
- **`secretOrPrivateKey must have a value`**: `JWT_SECRET` is missing in `.env`.
- **`Nest can't resolve dependencies of the JWT_MODULE_OPTIONS`**: `ConfigModule` must be registered with `isGlobal: true`.
