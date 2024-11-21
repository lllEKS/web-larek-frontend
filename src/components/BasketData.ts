import { IEvents } from './base/events';
import { ICard, IBasket } from '../types';

export class BasketData {
	basket: IBasket = {
		items: [],
		total: 0,
	};

	constructor(protected events: IEvents) {}

	productInBasket(item: ICard): boolean {
		return this.isValidItem(item) && this.basket.items.includes(item.id);
	}

	addBasket(item: ICard) {
		this.updateBasket(item.id, item.price, true);
	}

	deleteBasket(item: ICard) {
		this.updateBasket(item.id, item.price, false);
	}

	clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.emitBasketChange();
	}

	private updateBasket(itemId: string, itemPrice: number, isAdding: boolean) {
		if (isAdding) {
			this.basket.items.push(itemId);
			this.basket.total += itemPrice;
		} else {
			this.basket.items = this.basket.items.filter((id) => id !== itemId);
			this.basket.total -= itemPrice;
		}
		this.emitBasketChange();
	}

	private emitBasketChange() {
		this.events.emit('basket:changed', this.basket.items);
	}

	private isValidItem(item: ICard): boolean {
		return !!(item && item.id);
	}
}
