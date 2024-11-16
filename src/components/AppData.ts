import {
	FormValidateErrorsDelivery,
	FormValidateErrorsContacts,
	IOrder,
	IOrderFormDelivery,
	IOrderFormContacts,
	IProductItem,
	IAppStatus,
} from '../types';
import { Model } from './base/Model';

export type ProductStatus = 'sell' | 'basket';

export class ProductItem extends Model<IProductItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	status: ProductStatus = 'sell';
	count: number;
}

export class AppStatus extends Model<IAppStatus> {
	basket: ProductItem[] = [];
	catalog: ProductItem[];
	order: IOrder = {
		address: '',
		items: [],
		payment: 'online',
		email: '',
		phone: '',
		total: 0,
	};

	FormValidateErrorsDelivery: FormValidateErrorsDelivery = {};
	FormValidateErrorsContacts: FormValidateErrorsContacts = {};

	clearBasket() {
		this.basket.forEach((item) => {
			item.status = 'sell';
		});
		this.basket = [];
	}

	getTotal() {
		return this.basket.reduce((total, item) => total + item.price, 0);
	}

	setCatalog(items: IProductItem[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setDeliveryField(field: keyof IOrderFormDelivery, value: string) {
		this.order[field] = value;

		if (this.checkOrdersDeliveryValidation()) {
			this.events.emit('order:ready', this.order);
		}
	}

	checkOrdersDeliveryValidation() {
		const errors: typeof this.FormValidateErrorsDelivery = {};

		if (!this.order.address) {
			errors.address = 'Введите адрес для доставки';
		}
		this.FormValidateErrorsDelivery = errors;
		this.events.emit(
			'FormValidateErrorsDelivery:change',
			this.FormValidateErrorsDelivery
		);

		return Object.keys(errors).length === 0;
	}

	setContactsField(field: keyof IOrderFormContacts, value: string) {
		this.order[field] = value;
		if (this.checkOrdersContactsValidation()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	checkOrdersContactsValidation() {
		const errors: typeof this.FormValidateErrorsContacts = {};
		const emailRegepx = /^[a-zA-Z0-9._]+@[a-z]+.[a-z]{2,5}$/;
		const phoneRegexp = /^[\+7](\d){11,12}$/;

		if (!emailRegepx.test(this.order.email) || !this.order.email) {
			errors.email = 'Введите email в формате email@mail.com';
		}
		if (!phoneRegexp.test(this.order.phone) || !this.order.phone) {
			errors.phone = 'Введите номер телефона в формате +7xxxxxxxxxx';
		}
		this.FormValidateErrorsContacts = errors;
		this.events.emit(
			'FormValidateErrorsContacts:change',
			this.FormValidateErrorsContacts
		);

		return Object.keys(errors).length === 0;
	}

	toggleBasketList(item: ProductItem) {
		if (item.status === 'sell' && item.price !== null) {
			this.basket.push(item);
			item.status = 'basket';
			item.count = this.basket.length;
			this.emitChanges('basket:changed', this.basket);
		} else if (item.status === 'basket') {
			this.basket = this.basket.filter((elem) => elem !== item);
			item.status = 'sell';
			item.count = this.basket.length;
			this.emitChanges('basket:changed', this.basket);
		}
	}

	getBasketList(): ProductItem[] {
		return this.basket;
	}
}
