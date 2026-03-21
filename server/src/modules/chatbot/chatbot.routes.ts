import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chat, publicChat } from './chatbot.controller';
import { validate, chatMessageRules } from '../../middleware/validation.middleware';

const router = Router();

router.post('/public', chatMessageRules, validate, publicChat);
router.post('/', authenticate, chatMessageRules, validate, chat);

export default router;
