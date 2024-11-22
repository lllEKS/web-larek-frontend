import { PaymentMethod, IOrder, OrderForm } from '../types';

import { IEvents } from './base/events';

export class OrderData {
	order: IOrder = {
		payment: 'card',
		email: '',
		phone: '',
		address: '',
	};

	formErrors: Partial<Record<keyof OrderForm, string>> = {};

	constructor(protected events: IEvents) {}

	setPayment(method: PaymentMethod) {
		this.order.payment = method;
	}

	setOrderField(field: keyof OrderForm, value: string) {
		if (field === 'payment') {
			this.setPayment(value as PaymentMethod);
		} else {
			this.order[field] = value;
		}

		if (this.validateForm()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateForm() {
		const errors: typeof this.formErrors = {};
		const emailRegepx = /^[a-zA-Z0-9._]+@[a-z]+.[a-z]{2,5}$/;
		const phoneRegexp = /^[\+7](\d){11,12}$/;
		if (!this.order.payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Введите адрес доставки';
		}
		if (!emailRegepx.test(this.order.email) || !this.order.email) {
			errors.email = 'Введите email в формате email@mail.com';
		}
		if (!phoneRegexp.test(this.order.phone) || !this.order.phone) {
			errors.phone = 'Введите номер телефона в формате +7xxxxxxxxxx';
		}
		this.formErrors = errors;
		this.events.emit('FormErrors:change', errors);
		return Object.keys(errors).length === 0;
	}
}
