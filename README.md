# Cloudflare Workers React Starter Template

[cloudflarebutton]

A production-ready full-stack application template powered by Cloudflare Workers. Features a modern React frontend with Tailwind CSS & shadcn/ui, a Hono-based API backend, and Durable Objects for scalable, stateful entities (Users, ChatBoards with Messages). Includes TanStack Query for optimistic data fetching, theme support, error handling, and hot reload development.

## ✨ Key Features

- **Full-Stack TypeScript**: Shared types between frontend and Workers backend.
- **Durable Objects Entities**: Auto-indexed storage for Users and ChatBoards (chats with embedded messages).
- **Pre-seeded Demo Data**: Users, chats, and messages load automatically.
- **Modern UI**: shadcn/ui components, Tailwind with custom animations/gradients, dark mode.
- **API Routes**: CRUD for users/chats/messages (`/api/users`, `/api/chats`, `/api/chats/:id/messages`).
- **Development Workflow**: Vite HMR, Bun-powered, Wrangler deployment.
- **Production-Ready**: CORS, logging, error boundaries, client error reporting.
- **SPA Assets**: Cloudflare Assets for single-page app handling.

## 🛠 Tech Stack

| Frontend | Backend | Tools |
|----------|---------|-------|
| React 18 | Hono 4 | Bun |
| Vite 6 | Durable Objects | Cloudflare Workers |
| Tailwind CSS | TypeScript | Wrangler |
| shadcn/ui | Cloudflare SQLite (migrations) | TanStack Query |
| Lucide Icons |  | Zod |
| React Router |  | Sonner (Toasts) |
| Framer Motion |  | Immer/Zustand |

## 🚀 Quick Start

1. **Prerequisites**:
   - [Bun](https://bun.sh/) installed
   - [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
   - Cloudflare account (free tier works)

2. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd collab-dealdesk-lmm7fdbnqbsgjnl908ecn
   bun install
   ```

3. **Development**:
   ```bash
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000). API at `/api/health`.

4. **Type Generation** (Cloudflare types):
   ```bash
   bun run cf-typegen
   ```

## 📚 Usage Examples

### API Endpoints (Hono-powered)

- **Users**:
  ```bash
  # List (paginated)
  curl "http://localhost:8787/api/users?limit=10"

  # Create
  curl -X POST http://localhost:8787/api/users \
    -H "Content-Type: application/json" \
    -d '{"name": "New User"}'

  # Delete
  curl -X DELETE http://localhost:8787/api/users/u1
  ```

- **Chats**:
  ```bash
  # List
  curl "http://localhost:8787/api/chats"

  # Create
  curl -X POST http://localhost:8787/api/chats \
    -d '{"title": "New Chat"}'

  # Messages in chat
  curl "http://localhost:8787/api/chats/c1/messages"

  # Send message
  curl -X POST http://localhost:8787/api/chats/c1/messages \
    -d '{"userId": "u1", "text": "Hello!"}'
  ```

Demo data auto-seeds on first API call (Users: A/B, Chat: General).

### Frontend Customization

- Replace `src/pages/HomePage.tsx` with your app.
- Add routes in `src/main.tsx` (React Router).
- Extend entities in `worker/entities.ts` (uses `core-utils.ts` library).
- Add routes in `worker/user-routes.ts`.
- UI: Use shadcn components (`@/components/ui/*`), hooks (`@/hooks/*`).

## 🔧 Development

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server (Vite + Worker proxy) |
| `bun build` | Build frontend assets |
| `bun lint` | Lint codebase |
| `bun preview` | Local preview of production build |
| `wrangler dev` | Direct Worker dev (bypass Vite) |
| `bun run cf-typegen` | Generate `worker/env.d.ts` types |

**Hot Reload**: Frontend HMR via Vite. Backend auto-reloads `user-routes.ts`.

**Customizing Entities**:
- Extend `IndexedEntity` in `worker/entities.ts`.
- Routes auto-wire via `userRoutes()` export.
- Indexes handle pagination (`?cursor=&limit=10`).

## ☁️ Deployment

1. **Login**:
   ```bash
   wrangler login
   wrangler whoami
   ```

2. **Configure** (`wrangler.jsonc`):
   - Set `account_id` if needed.
   - Assets auto-deploy to Cloudflare Pages.

3. **Deploy**:
   ```bash
   bun run deploy
   ```
   Or:
   ```bash
   bun build && wrangler deploy
   ```

[cloudflarebutton]

**Custom Domain**: `wrangler deploy --var ASSETS_URL:https://your-pages-domain.pages.dev`.

**Durable Objects**: Auto-migrated via `wrangler.jsonc` (SQLite-backed).

## 🤝 Contributing

1. Fork & clone.
2. `bun install`.
3. `bun dev`.
4. Submit PR.

## 📄 License

MIT. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [shadcn/ui](https://ui.shadcn.com/)
- File issues here.

Built with ❤️ for Cloudflare Developers.