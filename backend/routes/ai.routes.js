import express from 'express';
import { farmingAssistant } from '../controllers/ai.controller.js';

const router = express.Router();

// POST /api/ai/farming-assistant
// Public endpoint — no auth required so guests can also use the AI assistant
router.post('/farming-assistant', farmingAssistant);

export default router;
