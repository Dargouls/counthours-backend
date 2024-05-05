import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();
const { DATABASE_NAME, DATABASE_PORT, DATABASE_USER, DATABASE_HOST, DATABASE_PASSWORD } =
	process.env;

const config = {
	client: 'pg',
	connection: {
		host: DATABASE_HOST,
		port: Number(DATABASE_PORT) || 5432,
		user: DATABASE_USER,
		password: DATABASE_PASSWORD,
		database: DATABASE_NAME,
	},
	migrations: {
		directory: './src/database/migrations',
	},
};

export default config;
