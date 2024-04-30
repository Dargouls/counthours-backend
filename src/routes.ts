import { Request, Response, Router } from 'express';
const ServiceController = require('./controllers/serviceController');
const MergedServiceController = require('./controllers/mergedServiceController');
const UserController = require('./controllers/userControler');

const routes = Router();

routes.get('/', (request: Request, response: Response) => {
	return response.send(
		'Sejá Bem vindo ao Back-End do App APT, contact um Administrador para entender as rotas! '
	);
});
routes.get('/services', (request: Request, response: Response) => {
	return ServiceController.findAll(request, response);
});
routes.post('/services', (request: Request, response: Response) => {
	return ServiceController.create(request, response);
});
routes.patch('/service/update/:id', (request: Request, response: Response) => {
	return ServiceController.update(request, response);
});
routes.get('/services/:id', (request: Request, response: Response) => {
	return ServiceController.findById(request, response);
});
routes.get('/service/user/:userId', (request: Request, response: Response) => {
	return ServiceController.findByUserId(request, response);
});
routes.get('/services/user/:userId', (request: Request, response: Response) => {
	return ServiceController.findAllByUserId(request, response);
});

routes.post('/services/merge', (request: Request, response: Response) => {
	return MergedServiceController.mergeServices(request, response);
});
routes.get('/services/all/:userId', (request: Request, response: Response) => {
	return MergedServiceController.findAllByUserId(request, response);
});
routes.get('/services/all', (request: Request, response: Response) => {
	return MergedServiceController.findAll(request, response);
});

routes.post('/create-account', (request: Request, response: Response) => {
	return UserController.create(request, response);
});

module.exports = routes;
