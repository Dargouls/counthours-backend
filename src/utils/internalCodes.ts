const internalCodes = {
	USER_NOT_FOUND: 1000,
	USER_ALREADY_EXISTS: 1001,
	USER_PASSWORD_INCORRECT: 1002,
	USER_NOT_AUTHORIZED: { internalCode: 1003, message: 'Token de autorização inválido' },
	MISSING_PASSWORD: 1004,
	ACCESSTOKEN_EXPIRED: 1005,
	REFRESHTOKEN_EXPIRED: 1006,
	TOKEN_EXPIRED: { internalCode: 1007, message: 'Token inválido ou expirado' },
};

export { internalCodes };
