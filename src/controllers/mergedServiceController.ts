import dayjs from 'dayjs';
import { Request, Response } from 'express';
const connection = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

interface IService {
	id: string;
	name: string;
	user_id: string;
	start_date: string;
	end_date: string;
	is_merged: boolean; //Quando ele é um dos serviços que se fundiu
	is_principal: boolean; //Quando ele é o serviço resultante da fusão
}

module.exports = {
	async mergeServices(request: Request, response: Response) {
		const { name, user_id, ids } = request.body;

		let servicesList: IService[] = [];
		try {
			servicesList = await connection('Service').select('*').whereIn('id', ids);

			if (servicesList.length === 0)
				return response.status(202).json({ message: 'Serviços não encontrados' });
		} catch (error) {
			console.error('Erro ao buscar serviços: ', error);
			return response.status(500).json({ message: 'Erro ao buscar serviços' });
		}

		//Verifica a menor e maior data
		const majorService = servicesList.reduce(
			(acc, actual) => {
				return new Date(acc?.end_date) > new Date(actual?.end_date) ? acc : actual;
			},
			{ end_date: '1970-01-01T00:00:00.000Z' }
		);
		const minorService = servicesList.reduce(
			(acc, actual) => {
				return new Date(acc?.start_date) < new Date(actual?.start_date) ? acc : actual;
			},
			{ start_date: majorService.end_date }
		);

		let totalHours = 0;
		let totalMinutes = 0;

		servicesList.forEach((service) => {
			totalHours += dayjs(service.end_date).diff(dayjs(service.start_date), 'hour');
			totalMinutes += dayjs(service.end_date).diff(dayjs(service.start_date), 'minute') % 60;
		});
		totalHours += Math.floor(totalMinutes / 60);
		totalMinutes = totalMinutes % 60;

		if (isNaN(totalHours) || isNaN(totalMinutes))
			return response.status(400).json({ message: 'Um dos valores é NaN' });

		try {
			//faz o merge criando um novo serviço
			const servicesMerged: any = await connection('Service').insert(
				{
					id: uuidv4(),
					name,
					user_id,
					total_hours: `${totalHours}:${totalMinutes}`,
					start_date: minorService.start_date,
					end_date: majorService.end_date,
					is_merged: false,
					is_principal: true,
				},
				['id']
			);

			//Pega todos os que foram fundidos e adiciona os relacionamentos
			const mergeRelationships = servicesList.map((service) => ({
				service_id: service.id,
				merge_id: servicesMerged[0].id,
			}));
			await connection('MergeRelationship').insert(mergeRelationships);
			await connection('Service').whereIn('id', ids).update({ is_merged: true });

			return response.status(200).json({ message: 'Serviços mesclados com sucesso!' });
		} catch (err) {
			console.log(err);
			return response.status(400).json({ message: 'Não foi possível mesclar os serviços' });
		}
	},
	async findAll(request: Request, response: Response) {
		try {
			const services = await connection('Service').select('*');
			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviços não encontrados' });
		}
	},

	async findAllByUserId(request: Request, response: Response) {
		const { userId } = request.params;
		try {
			const services = await connection('Service')
				.where('user_id', userId)
				.andWhere('is_merged', false || null)
				.select('*');

			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviço não encontrado' });
		}
	},
};
