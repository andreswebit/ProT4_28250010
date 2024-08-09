import { Router} from 'express';
import{libro} from './controller.js';

export const router = Router()

router.get('/libros', libro.getAll);
router.get('/libros/:id', libro.getOne);
router.post('/libros', libro.add);
router.delete('/libros/:ISBN', libro.delete);
router.put('/libros', libro.update);