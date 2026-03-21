import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chat } from './chatbot.controller';

const router = Router();

router.post('/', authenticate, chat);

export default router;
