import { Request, Response, Router } from 'express';
import { ServiceController } from './controllers/serviceController';
import { MergedServiceController } from './controllers/mergedServiceController';

const routes = Router();
const serviceController = new ServiceController();
const mergedServiceController = new MergedServiceController();

routes.get('/', (request: Request, response: Response) => {
	return response.send(
		'Sejá Bem vindo ao Back-End do App APT, contact um Administrador para entender as rotas! '
	);
});

routes.get('/services', (request: Request, response: Response) => {
	return serviceController.findAll(request, response);
});
routes.post('/services', (request: Request, response: Response) => {
	return serviceController.create(request, response);
});
routes.patch('/service/update/:id', (request: Request, response: Response) => {
	return serviceController.update(request, response);
});
routes.get('/services/:id', (request: Request, response: Response) => {
	return serviceController.findById(request, response);
});
routes.get('/service/user/:userId', (request: Request, response: Response) => {
	return serviceController.findByUserId(request, response);
});
routes.get('/services/user/:userId', (request: Request, response: Response) => {
	return serviceController.findAllByUserId(request, response);
});
routes.delete('/services/:id', (request: Request, response: Response) => {
	return serviceController.deleteById(request, response);
});
routes.patch('/services/end/:id', (request: Request, response: Response) => {
	return serviceController.updateEndDate(request, response);
});

routes.post('/services/merge', (request: Request, response: Response) => {
	return mergedServiceController.mergeServices(request, response);
});
routes.get('/services/all/:userId', (request: Request, response: Response) => {
	return mergedServiceController.findAllByUserId(request, response);
});
routes.get('/services/all', (request: Request, response: Response) => {
	return mergedServiceController.findAll(request, response);
});

export default routes;
