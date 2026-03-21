import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chat, publicChat } from './chatbot.controller';

const router = Router();

router.post('/public', publicChat);
router.post('/', authenticate, chat);

export default router;
