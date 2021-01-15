import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, validateRequest } from '@rztickets/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

router.post(
  '/api/orders',
  // @ts-ignore
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket the user is trying to order in the db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    // Ensure that the ticket isn't already reserved

    // Calculate an expiration date for this order

    // Build the order and save it to the database

    // Publish Order created event


    res.send({});
  }
);

export { router as newOrderRouter };
