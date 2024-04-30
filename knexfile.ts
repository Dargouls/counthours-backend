import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();
const { DATABASE_NAME, DATABASE_PORT, DATABASE_USER, DATABASE_HOST, DATABASE_PASSWORD } =
	process.env;

module.exports = {
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

// module.exports = {
// 	development: {
// 		client: 'pg',
// 		connection: {
// 			host: process.env.DATABASE_HOST,
// 			port: process.env.DATABASE_PORT,
// 			user: process.env.DATABASE_USER,
// 			password: process.env.DATABASE_PASSWORD,
// 			database: process.env.DATABASE_NAME,
// 		},
// 		migrations: {
// 			directory: './src/database/migrations',
// 		},
// 	},
// 	production: {
// 		client: 'pg',
// 		connection: {
// 			connectionString: process.env.DATABASE_URL,
// 			ssl: { rejectUnauthorized: false },
// 		},
// 		ssl: true,
// 		pool: {
// 			min: 2,
// 			max: 10,
// 		},
// 		migrations: {
// 			directory: './src/database/migrations',
// 		},
// 		useNullAsDefault: 'true',
// 	},
// 	productionMysql: {
// 		client: 'mysql',
// 		connection: {
// 			host: process.env.DATABASE_HOST,
// 			port: process.env.DATABASE_PORT,
// 			user: process.env.DATABASE_USER,
// 			password: process.env.DATABASE_PASSWORD,
// 			database: process.env.DATABASE_NAME,
// 		},
// 		pool: { min: 0, max: 7 },
// 		migrations: {
// 			directory: './src/database/migrations',
// 		},
// 	},
// };
