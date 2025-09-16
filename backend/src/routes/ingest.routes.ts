// routes/chat.routes.ts
import { Router } from 'express';
import { ingestHandler } from '../controllers/ingest.controller';

const router = Router();

router.post('/ingest', ingestHandler);

export default router;
