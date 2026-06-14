import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import customOrders from './routes/customOrders.js';
dotenv.config();

const app = express();
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:10,
  message:{message : "Mred nta non ? , Tsena 15 min w eawd seft."}
});

app.use('/api/auth',authLimiter, authRoutes); 
app.use('/api/categories',categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/custom-orders',customOrders);
app.use('/api/users',userRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server's listenning in -> http://localhost:${PORT}`);
  });
}

export default app;