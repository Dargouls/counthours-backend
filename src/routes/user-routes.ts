import { Request, Response, Router } from 'express';
import { UserController } from '../controllers/userController';
import {
	generateRefreshToken,
	generateToken,
	verifyRefreshToken,
	verifyToken,
} from '../utils/auth';
import { internalCodes } from '../utils/internalCodes';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post('/create-account', (request: Request, response: Response) => {
	return userController.create(request, response);
});

userRoutes.post('/login', (request: Request, response: Response) => {
	return userController.login(request, response);
});

userRoutes.post('/verify/access-token', (request: Request, response: Response) => {
	const { token, refreshToken } = request.body;
	if (token === 'jwt expired')
		return response
			.status(400)
			.json({ internalCode: internalCodes.ACCESSTOKEN_EXPIRED, error: 'token expired' });

	return token;
});

userRoutes.post('/verify/get/access-token', (request: Request, response: Response) => {
	const { id, email, name, refreshToken } = request.body;
	if (!id || !email || !name)
		return response.status(500).json({ message: 'params refresh = undefined || null' });
	console.log(refreshToken);
	if (!refreshToken)
		return response.status(500).json({ message: 'refreshToken = undefined || null' });

	if (verifyRefreshToken(refreshToken) === 'jwt expired')
		return response
			.status(400)
			.json({ internalCode: internalCodes.REFRESHTOKEN_EXPIRED, error: 'token expired' });

	const newToken = generateToken({ id, email, name });
	return response.status(200).json({ accessToken: newToken });
});

userRoutes.post('/verify/get/refresh-token', (request: Request, response: Response) => {
	const { id, email, name, refreshToken } = request.body;
	if (!id || !email || !name)
		return response.status(500).json({ message: 'params refresh = undefined || null' });

	if (!refreshToken)
		return response.status(500).json({ message: 'refreshToken = undefined || null' });

	if (verifyRefreshToken(refreshToken) === 'jwt expired')
		return response
			.status(400)
			.json({ internalCode: internalCodes.REFRESHTOKEN_EXPIRED, error: 'token expired' });

	const newToken = generateRefreshToken({ id, email, name });
	return response.status(200).json({ refreshToken: newToken });
});

export default userRoutes;
