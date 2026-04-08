// src/routes/protocol.routes.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProtocolSchema } from '../validators/protocol.validators.js';
import {
  createProtocol,
  getProtocols,
  getProtocolById,
  updateProtocol,
  deleteProtocol,
  getProtocolSummary,
} from '../controllers/protocol.controller.js';

const router = Router();
router.use(authenticate);

// Static routes before dynamic :param routes — same rule as meal.routes.js
router.get('/summary', getProtocolSummary); // cross-references meal stats
router.post('/',               createProtocol);
router.get('/',                getProtocols);
router.get('/:protocolId',     getProtocolById);
router.patch('/:protocolId',   updateProtocol);
router.delete('/:protocolId',  deleteProtocol);

export default router;