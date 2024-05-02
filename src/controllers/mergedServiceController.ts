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
				return dayjs(acc?.end_date).toISOString() > dayjs(actual?.end_date).toISOString()
					? acc
					: actual;
			},
			{ end_date: '1970-01-01T00:00:00.000Z' }
		);
		const minorService = servicesList.reduce(
			(acc, actual) => {
				return dayjs(acc?.start_date).toISOString() < dayjs(actual?.start_date).toISOString()
					? acc
					: actual;
			},
			{ start_date: majorService.end_date }
		);

		let totalTime = 0;

		servicesList.forEach((service) => {
			totalTime += dayjs(service.end_date).diff(dayjs(service.start_date));
		});

		if (isNaN(totalTime) || totalTime < 0)
			return response.status(400).json({ message: 'Horas negativas' });

		try {
			//faz o merge criando um novo serviço
			const servicesMerged: any = await connection('Service').insert(
				{
					id: uuidv4(),
					name,
					user_id,
					total_hours: totalTime,
					start_date: dayjs(minorService.start_date).toISOString(),
					end_date: dayjs(majorService.end_date).toISOString(),
					is_merged: null,
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
				.andWhere('is_merged', false)
				.orWhereNull('is_merged')
				.select('*');

			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviço não encontrado' });
		}
	},
};
