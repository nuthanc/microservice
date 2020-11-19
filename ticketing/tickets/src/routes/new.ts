import express, { Request, Response } from 'express';
import {requireAuth} from '@rztickets/common';

const router = express.Router();

router.post('/api/tickets', requireAuth, (req:Request, res: Response) => {
  console.log(req.body);
  res.sendStatus(200);
})

export { router as createTicketRouter };
