import { ICard } from '../types';

import { IEvents } from './base/events';

export class CardData {
	items: ICard[] = [];
	preview: ICard;

	constructor(protected events: IEvents) {}
	setCatalog(items: ICard[]) {
		this.items = items;
		this.events.emit('items:changed', this.items);
	}

	setPreview(item: ICard) {
		this.preview = item;
		this.events.emit('preview:changed', this.preview);
	}

	getOrderId() {
		return this.items.map((item) => item.id);
	}
}
