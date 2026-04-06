import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPosts, createPost, toggleLike, addComment } from '../controllers/communityController.js';

const router = express.Router();

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.route('/:id/like')
    .put(protect, toggleLike);

router.route('/:id/comment')
    .post(protect, addComment);

export default router;
