import dayjs from 'dayjs';
import { Request, Response } from 'express';

const connection = require('../database/connection');

interface ServiceForUpdate {
	name?: string | undefined;
	start_date?: string | undefined;
	end_date?: string | undefined;
}

module.exports = {
	async create(request: Request, response: Response) {
		let { name, user_id, start_date, end_date } = request.body;

		if (!start_date) return response.status(400).json({ message: 'Sem data inicial' });

		const start = dayjs(start_date).format('YYYY-MM-DDTHH:mm:ssZ');
		const end = dayjs(end_date).format('YYYY-MM-DDTHH:mm:ssZ');

		try {
			await connection('Service').insert({
				name,
				user_id,
				start_date: start,
				end_date: isNaN(Number(end)) ? null : null,
			});
		} catch (error) {
			return response.status(400).json({ message: 'Não foi possível criar serviço' });
		}

		return response.status(200).send({ message: 'Service created!' });
	},

	async update(request: Request, response: Response) {
		const { id } = request.params;
		const { name, start_date, end_date } = request.body;
		let service: ServiceForUpdate = {};

		if (name) service.name = name;
		if (start_date) service.start_date = dayjs(start_date).format();
		if (end_date) service.end_date = dayjs(end_date).format();

		try {
			await connection('Service').where('id', id).update(service);
		} catch (error) {
			return response.status(400).json({ message: 'Não foi possível atualizar o Serviço' });
		}
		return response.status(200).send({ message: 'Service updated!' });
	},

	async findAll(request: Request, response: Response) {
		try {
			const services = await connection('Service').select('*');
			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviços não encontrados' });
		}
	},

	async findById(request: Request, response: Response) {
		const { id } = request.params;
		try {
			const service = await connection('Service').where('id', id).select('*').first();
			return response.json(service);
		} catch (error) {
			return response.status(404).json({ error: 'Serviço não encontrado' });
		}
	},

	async findByUserId(request: Request, response: Response) {
		const { userId } = request.params;
		try {
			const service = await connection('Service')
				.whereNull('end_date')
				.andWhere('user_id', userId)
				.select('*')
				.orderBy('start_date', 'desc')
				.first();
			return response.json(service);
		} catch (error) {
			return response.status(404).json({ message: 'Serviço não encontrado' });
		}
	},

	async findAllByUserId(request: Request, response: Response) {
		const { userId } = request.params;
		try {
			const services = await connection('Service')
				.where('user_id', userId)
				.select('*')
				.orderBy('id', 'desc');

			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviços não encontrados' });
		}
	},
};
