import { Request, Response } from 'express';

const connection = require('../database/connection');
module.exports = {
	async create(request: Request, response: Response) {
		const { name, email, password } = request.body;
		if (!name || !email || !password) return;

		try {
			const response = await connection('User').insert({
				name,
				email,
				password,
				created_at: new Date(),
			});
		} catch (error) {
			console.log(error);
			return response.status(400).json({ error: 'Unexpected error while creating new user' });
		}

		return response.status(200).send({ message: 'user created!' });
	},

	async findAll(request: Request, response: Response) {
		const services = await connection('User').select('*');
		return response.json(services);
	},
};
