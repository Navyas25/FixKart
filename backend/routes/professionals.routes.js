import { Router } from 'express';
import {
  getAllProfessionals,
  getProfessionalById,
} from '../controllers/professionals.controller.js';

const router = Router();

router.get('/', getAllProfessionals);
router.get('/:id', getProfessionalById);

export default router;
