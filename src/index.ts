import express from 'express';
import cors from 'cors';
import routes from './routes';
import userRoutes from './routes/user-routes';
import colors from 'colors';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dotenv from 'dotenv';
import { authorization } from './utils/auth';

dayjs.locale('de');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');
dotenv.config();

const { DATABASE_NAME, PORT } = process.env;
const app = express();

app.use(cors());
app.use(express.json());
app.use(authorization);
app.use(routes);
app.use(userRoutes);
const port = PORT || 8877;

app.listen(PORT, () => {
	console.clear();
	console.log(colors.green('Escutando na porta: ' + port));
	console.log(colors.green('Database name: ' + DATABASE_NAME));
});
