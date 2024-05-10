export interface IService {
	id: string;
	name: string;
	user_id: string;
	start_date: string;
	end_date: string;
	total_hours: number;
	is_merged: boolean; //Quando ele é um dos serviços que se fundiu
	is_principal: boolean; //Quando ele é o serviço resultante da fusão
}
