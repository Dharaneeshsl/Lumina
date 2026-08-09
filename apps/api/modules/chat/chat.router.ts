import * as chatController from './chat.handler'
import { requireAuth } from '../../middleware'
import { Router } from 'express'

const router = Router()

router.get('/token',requireAuth, chatController.getChatToken as any);
router.post('/conversations', requireAuth, chatController.createOneToOneConversation as any)
router.get('/conversations', requireAuth, chatController.getMyConversations as any)

export default router
