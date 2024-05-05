import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { hashPassword, generateToken, generateRefreshToken } from '../utils/auth';
import connection from '../database/connection';
import bcrypt from 'bcryptjs';
import { internalCodes } from '../utils/internalCodes';

class UserController {
	async create(request: Request, response: Response) {
		const { name, email, password } = request.body;
		if (!name || !email || !password)
			return response.status(400).json({ error: 'Missing parameters' });

		try {
			const hasUserCreated = await connection('User').select('*').where({ email });
			if (hasUserCreated.length > 0)
				return response.status(400).json({ error: 'User already exists' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ error: 'Unexpected error while creating new user' });
		}

		const id = bcrypt.hash('123456', 10);

		try {
			const user = await connection('User')
				.insert({
					name,
					email,
					password: await bcrypt.hash(password, 10),
					created_at: dayjs().toISOString(),
				})
				.returning('*');

			const accessToken = generateToken(user[0].id);
			const refreshToken = generateRefreshToken(user[0].id);

			return response
				.status(200)
				.send({ tokens: { accessToken, refreshToken }, message: 'user created!' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ error: 'Unexpected error while creating new user' });
		}
	}

	async login(request: Request, response: Response) {
		const { email, password } = request.body;

		if (!email || !password)
			return response
				.status(400)
				.json({ internalCode: internalCodes.MISSING_PASSWORD, message: 'Missing parameters' });
		try {
			const user = await connection('User').select('*').where({ email });

			if (user.length === 0)
				return response
					.status(404)
					.json({ internalCode: internalCodes.USER_NOT_FOUND, message: 'Conta não encontrada' });
			const passwordMatch = bcrypt.compareSync(password, user[0].password);
			if (!passwordMatch)
				return response.status(400).json({
					internalCode: internalCodes.USER_PASSWORD_INCORRECT,
					message: 'password incorrect',
				});

			const accessToken = generateToken({
				id: user[0].id,
				email: user[0].email,
				name: user[0].name,
			});
			const refreshToken = generateRefreshToken({
				id: user[0].id,
				email: user[0].email,
				name: user[0].name,
			});
			return response
				.status(200)
				.json({ tokens: { accessToken, refreshToken }, message: 'Logged!' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ error: 'Unexpected error while logging' });
		}
	}

	async findAll(request: Request, response: Response) {
		const services = await connection('User').select('*');
		return response.json(services);
	}
}

export { UserController };
