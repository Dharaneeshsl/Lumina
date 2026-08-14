import { requireAuth, upload } from '../../middleware'
import {
  deleteCoverImage,
  deleteProfilePicture,
  getMyProfile,
  getProfileByUsername,
  updateMyProfile,
  uploadCoverImage,
  uploadProfilePicture,
} from './profile.handler'
import { MSG_PROFILE_ROUTER_WORKS } from '@lumina/constants'
import { Router } from 'express'

export const profileRouter = Router()

profileRouter.get('/test', (req, res) => {
  res.json({ message: MSG_PROFILE_ROUTER_WORKS })
})

profileRouter.get('/me', requireAuth, getMyProfile)
profileRouter.patch('/me', requireAuth, updateMyProfile)
profileRouter.get('/:username', getProfileByUsername)
profileRouter.patch('/avatar', requireAuth, upload.single('image'), uploadProfilePicture)
profileRouter.delete('/avatar', requireAuth, deleteProfilePicture)
profileRouter.patch('/cover', requireAuth, upload.single('image'), uploadCoverImage)
profileRouter.delete('/cover', requireAuth, deleteCoverImage)

export default profileRouter
