import { Form } from './common/Form';
import { OrderForm, PaymentMethod } from '../types';
import { ensureElement, ensureAllElements } from '../utils/utils';
import { IEvents } from './base/events';

export class Order extends Form<OrderForm> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this._cashButton = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);

		const setPaymentMethod = (method: PaymentMethod) => {
			this.changePayment = method;
			this.onInputChange('payment', method);
		};

		this._cardButton.addEventListener('click', () => setPaymentMethod('card'));
		this._cashButton.addEventListener('click', () => setPaymentMethod('cash'));

		this.toggleClass(this._cardButton, 'button_alt-active', true);
	}

	set changePayment(value: PaymentMethod) {
		this.toggleClass(this._cardButton, 'button_alt-active');
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
