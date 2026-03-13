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
    const page = await SimulationEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 20);
    return ok(c, page);
  });
  app.get('/api/simulations/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new SimulationEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Simulação não encontrada');
    const state = await entity.getState();
    return ok(c, state);
  });
  app.post('/api/simulations', async (c) => {
    const data = (await c.req.json()) as SimulationRecord;
    if (!data.id) data.id = crypto.randomUUID();
    if (!data.timestamp) data.timestamp = Date.now();
    const created = await SimulationEntity.create(c.env, data);
    return ok(c, created);
  });
  app.patch('/api/simulations/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const entity = new SimulationEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Simulação não encontrada');
    await entity.patch(body);
    return ok(c, await entity.getState());
  });
  app.delete('/api/simulations/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await SimulationEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
  // USERS & CHATS (Templates)
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, c.req.query('cursor') ?? null, 10);
    return ok(c, page);
  });
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const page = await ChatBoardEntity.list(c.env, c.req.query('cursor') ?? null, 10);
    return ok(c, page);
  });
}