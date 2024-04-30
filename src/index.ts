const express = require('express');
var cors = require('cors');
const routes = require('./routes');
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dotenv from 'dotenv';

dayjs.locale('de');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');
dotenv.config();
const { DATABASE_NAME, PORT } = process.env;
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const port = PORT || 8877;

app.listen(PORT, () => {
	console.clear();
	console.log('Escutando na porta: ' + port);
	console.log('Database name: ' + DATABASE_NAME);
});
