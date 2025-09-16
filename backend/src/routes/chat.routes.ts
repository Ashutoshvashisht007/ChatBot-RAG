// routes/chat.routes.ts
import { Router } from 'express';
import { chatHandler, historyHandler, clearHandler, persistHandler } from '../controllers/chat.controller';

const router = Router();

router.post('/chat', chatHandler);
router.get('/history/:sessionId', historyHandler);
router.delete('/history/:sessionId', clearHandler);
router.post('/persist/:sessionId', persistHandler);

export default router;
