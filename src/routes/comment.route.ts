import express from 'express';
import {
  createComment,
  deleteComment,
} from '../controllers/comment.controller';

const router = express.Router();

router.post('/', createComment);
router.delete('/:commentId', deleteComment);

export default router;