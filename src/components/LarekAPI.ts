import { IOrder, ICard, IOrderSuccess } from '../types';
import { Api, ApiListResponse } from './base/api';

//Методы для Api
export interface ILarekApi {
	getCardsList: () => Promise<ICard[]>;
	orderProducts: (order: IOrder) => Promise<IOrderSuccess>;
}

export class LarekApi extends Api implements ILarekApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string) {
		super(baseUrl);
		this.cdn = cdn;
	}

	getCardsList(): Promise<ICard[]> {
		return this.get(`/product`).then((data: ApiListResponse<ICard>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	orderProducts(order: IOrder): Promise<IOrderSuccess> {
		return this.post(`/order`, order).then((data: IOrderSuccess) => data);
	}
}
