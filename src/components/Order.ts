import { Form } from './common/Form';
import { IActions, IOrderFormDelivery } from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export const PaymentMethods: { [key: string]: string } = {
	card: 'online',
	cash: 'offline',
};

export class Order extends Form<IOrderFormDelivery> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
		super(container, events);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this._cashButton = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);

		this.toggleClass(this._cardButton, 'button_alt-active');

		if (actions?.onClick) {
			this._cardButton.addEventListener('click', actions.onClick);
			this._cashButton.addEventListener('click', actions.onClick);
		}
	}

	changePayment(target: HTMLElement) {
		this.toggleClass(this._cardButton, 'button_alt-active');
		this.toggleClass(this._cashButton, 'button_alt-active');
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
