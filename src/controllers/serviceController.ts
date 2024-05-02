import dayjs from 'dayjs';
import { Request, Response } from 'express';

const connection = require('../database/connection');
const { v4: uuidv4, validate } = require('uuid');

interface ServiceForUpdate {
	name?: string | undefined;
	start_date?: string | undefined;
	end_date?: string | undefined;
}

module.exports = {
	async create(request: Request, response: Response) {
		let { name, user_id, start_date } = request.body;

		if (!start_date) return response.status(400).json({ message: 'Sem data inicial' });

		try {
			const service = await connection('Service')
				.insert({
					id: uuidv4(),
					name,
					user_id,
					start_date: dayjs(start_date).toISOString(),
					end_date: null,
				})
				.returning('*');
			return response.status(200).send({ service: service[0], message: 'Service created!' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ message: 'Não foi possível criar serviço' });
		}
	},

	async update(request: Request, response: Response) {
		const { id } = request.params;
		const { name, start_date, end_date } = request.body;
		let service: ServiceForUpdate = {};

		if (name) service.name = name;
		if (start_date) service.start_date = dayjs(start_date).toISOString();
		if (end_date) service.end_date = dayjs(end_date).toISOString();

		try {
			await connection('Service').where('id', id).update(service);
			console.log('Service updated! ', id), service;
			return response.status(200).send({ message: 'Service updated!' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ message: 'Não foi possível atualizar o Serviço' });
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

			console.log(services);

			return response.json(services);
		} catch (error) {
			return response.status(404).json({ message: 'Serviços não encontrados' });
		}
	},

	async updateEndDate(request: Request, response: Response) {
		const { id } = request.params;

		if (!validate(id)) return response.status(500).json({ message: 'ID = undefined || null' });

		try {
			await connection('Service').where('id', id).update({ end_date: dayjs().toISOString() });
			return response.status(200).send({ message: 'Service updated!' });
		} catch (error) {
			console.log(error);
			return response.status(400).json({ message: 'Não foi possível atualizar o Serviço' });
		}
	},

	async deleteById(request: Request, response: Response) {
		const { id } = request.params;
		if (!id) return response.status(400).json({ message: 'ID = undefined || null' });
		const ids = id.split(',');

		try {
			await connection('Service').whereIn('id', ids).delete();
			return response.status(200).send({ data: ids, message: 'Service deleted!' });
		} catch (error) {
			console.log(error);
			return response
				.status(400)
				.json({ data: ids, message: 'Não foi possível deletar o Serviço' });
		}
	},
};
