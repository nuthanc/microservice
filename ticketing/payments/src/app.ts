import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@rztickets/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
// @ts-ignore
app.use(currentUser);


app.all('*', async () => {
  throw new NotFoundError();
});

// @ts-ignore
app.use(errorHandler);

export { app };
