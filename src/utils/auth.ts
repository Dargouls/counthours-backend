import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { internalCodes } from './internalCodes';

interface PayloadUser {
	id: number;
	email: string;
	name: string;
}

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

export const generateToken = ({ id, email, name }: PayloadUser) => {
	if (!JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY not defined');
	return jwt.sign({ id, email, name }, JWT_SECRET_KEY, { expiresIn: '1m' });
};

export const generateRefreshToken = ({ id, email, name }: PayloadUser) => {
	if (!JWT_REFRESH_SECRET_KEY) throw new Error('JWT_REFRESH_SECRET_KEY not defined');
	return jwt.sign({ id, email, name }, JWT_REFRESH_SECRET_KEY, { expiresIn: '9d' });
};

export const verifyToken = (token: string) => {
	if (!JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY not defined');
	const verify = jwt.verify(token, JWT_SECRET_KEY);

	return verify;
};

export const verifyRefreshToken = (token: string) => {
	if (!JWT_REFRESH_SECRET_KEY) throw new Error('JWT_REFRESH_SECRET_KEY not defined');
	const verify = jwt.verify(token, JWT_REFRESH_SECRET_KEY);
	return verify;
};

export const hashPassword = async (password: string) => {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, hashed: string) => {
	return bcrypt.compare(password, hashed);
};

export const authorization = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	const freeRoutes = {
		index: req.path === '/',
		createAccount: req.path.endsWith('/create-account'),
		login: req.path.endsWith('/login'),
		generateRefreshToken: req.path.endsWith('/get/refresh-token'),
		generateAccessToken: req.path.endsWith('/get/access-token'),
		services: req.path.includes('/services/all/'),
	};
	if (
		freeRoutes.createAccount ||
		freeRoutes.login ||
		freeRoutes.generateRefreshToken ||
		freeRoutes.generateAccessToken ||
		freeRoutes.services
	)
		return next();

	if (authHeader && authHeader.startsWith('Bearer ')) {
		if (!JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY not defined');
		const token = authHeader.split(' ')[1];
		jwt.verify(token, JWT_SECRET_KEY, (e) => {
			if (e?.name === 'TokenExpiredError') {
				return res.status(401).json(internalCodes.TOKEN_EXPIRED);
			}
			next(); // Passa para o próximo middleware ou rota
		});
	} else {
		res.status(401).json(internalCodes.USER_NOT_AUTHORIZED);
	}
};
