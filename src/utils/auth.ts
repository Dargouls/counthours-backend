import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { internalCodes } from './internalCodes';
const secretKey = '44964435-38cf-4aa1-9f7c-17b83026c580';
const refreshSecretKey = '44964435-38cf-4aa1-9f7c-17b83026c580';

interface PayloadUser {
	id: number;
	email: string;
	name: string;
}

export const generateToken = ({ id, email, name }: PayloadUser) => {
	return jwt.sign({ id, email, name }, secretKey, { expiresIn: '15m' });
};

export const generateRefreshToken = ({ id, email, name }: PayloadUser) => {
	return jwt.sign({ id, email, name }, refreshSecretKey, { expiresIn: '9d' });
};

export const verifyToken = (token: string) => {
	const verify = jwt.verify(token, secretKey);

	return verify;
};

export const verifyRefreshToken = (token: string) => {
	const verify = jwt.verify(token, refreshSecretKey);
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
	};
	if (
		freeRoutes.createAccount ||
		freeRoutes.login ||
		freeRoutes.generateRefreshToken ||
		freeRoutes.generateAccessToken
	)
		return next();

	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.split(' ')[1];
		jwt.verify(token, secretKey, (e) => {
			if (e?.name === 'TokenExpiredError') {
				return res.status(401).json(internalCodes.TOKEN_EXPIRED);
			}
			next(); // Passa para o próximo middleware ou rota
		});
	} else {
		res.status(401).json(internalCodes.USER_NOT_AUTHORIZED);
	}
};
