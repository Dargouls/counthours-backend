import dayjs from 'dayjs';
import { Request, Response } from 'express';
const connection = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

interface IService {
	id: number;
	name: string;
	user_id: string;
	start_date: string;
	end_date: string;
}

module.exports = {
	async mergeServices(request: Request, response: Response) {
		const { name, user_id, ids } = request.body;

		let servicesList: IService[] = [];
		try {
			servicesList = await connection('Service')
				.select('*') // ou selecione colunas específicas que você precisa
				.whereIn('id', ids);
		} catch (error) {
			return response.status(400).json({ message: 'Não foram encontrados estes períodos' });
		}

		const minorService = servicesList.reduce((acc, actual) => {
			return new Date(acc?.start_date) < new Date(actual?.start_date) ? acc : actual;
		});
		const majorService = servicesList.reduce((acc, actual) => {
			return new Date(acc?.end_date) > new Date(actual?.end_date) ? acc : actual;
		});

		let totalHours = 0;
		let totalMinutes = 0;

		servicesList.forEach((service) => {
			totalHours += dayjs(service.end_date).diff(dayjs(service.start_date), 'hour');
			totalMinutes += dayjs(service.end_date).diff(dayjs(service.start_date), 'minute') % 60;
		});
		totalHours += Math.floor(totalMinutes / 60);
		totalMinutes = totalMinutes % 60;

		try {
			const servicesMerged = await connection('MergedServices').insert(
				{
					id: uuidv4(),
					name,
					user_id,
					total_hours: `${totalHours}:${totalMinutes}`,
					start_date: minorService.start_date,
					end_date: majorService.end_date,
				},
				['id']
			);

			const mergeRelationships = servicesList.map((service) => ({
				service_id: service.id,
				merge_id: servicesMerged[0].id,
			}));

			await connection('MergeRelationship').insert(mergeRelationships);
			await connection('Service').whereIn('id', ids).update({ is_merged: true });
		} catch (err) {
			console.log(err);
			return response.status(400).json({ message: 'Não foi possível mesclar os serviços' });
		}
	},
	async findAll(request: Request, response: Response) {
		try {
			const services = await connection('MergedServices').select('*');
			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviços não encontrados' });
		}
	},

	async findAllByUserId(request: Request, response: Response) {
		const { userId } = request.params;
		try {
			const mergedService = await connection('MergedServices').where('id', userId).select('*');
			const services = await connection('Service')
				.where('user_id', userId)
				// .whereNot('is_merged', true)
				.select('*')
				.orderBy('id', 'desc');

			const all = await Promise.all([mergedService, services]).then((result) =>
				result[0].concat(result[1])
			);

			return response.json(all);
		} catch (error) {
			return response.status(404).json({ message: 'Serviço não encontrado' });
		}
	},
};
