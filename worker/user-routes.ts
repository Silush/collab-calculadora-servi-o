import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, SimulationEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { SimulationRecord } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Collab DealDesk API' }}));
  // SIMULATIONS
  app.get('/api/simulations', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await SimulationEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 10);
    return ok(c, page);
  });
  app.post('/api/simulations', async (c) => {
    const data = (await c.req.json()) as SimulationRecord;
    if (!data.id) data.id = crypto.randomUUID();
    if (!data.timestamp) data.timestamp = Date.now();
    const created = await SimulationEntity.create(c.env, data);
    return ok(c, created);
  });
  app.delete('/api/simulations/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await SimulationEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
}