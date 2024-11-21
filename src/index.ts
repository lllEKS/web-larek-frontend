import './scss/styles.scss';

import { OrderData } from './components/OrderData';
import { BasketData } from './components/BasketData';
import { EventEmitter } from './components/base/events';
import { LarekApi } from './components/LarekAPI';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { ICard, OrderForm } from './types';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Success } from './components/Success';
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const orderData = new OrderData(events);
const basketData = new BasketData(events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Вывод каталога товаров на главную страницу
events.on('items:changed', () => {
	page.catalog = orderData.items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});
});


// Открыть карточку товара
events.on('card:select', (item: ICard) => {
	orderData.setPreview(item);
});

// Изменение в выбранной карточке
events.on('preview:changed', (item: ICard) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (basketData.productInBasket(item)) {
				basketData.deleteBasket(item);
				card.button = 'sell';
			} else {
				basketData.addBasket(item);
				card.button = 'basket';
			}
		},
	});
	modal.render({
		content: card.render(item),
	});
});


// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

// Состояние корзины
events.on('basket:changed', () => {
	page.counter = basketData.basket.items.length;
	basket.items = basketData.basket.items.map((id, index) => {
		const item = orderData.items.find((item) => item.id === id);
		console.log(item);
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => basketData.deleteBasket(item),
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	basket.total = basketData.basket.total;
});

// Открыть форму оплата и адреса доставки
events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: 'card',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Открыть форму контактов
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('FormErrors:change', (errors: Partial<OrderForm>) => {
	const { payment, address, email, phone } = errors;
	order.valid = !payment && !address;
	contacts.valid = !email && !phone;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

events.on(/order\..*:change/,
	(data: { field: keyof OrderForm; value: string }) => {
		orderData.setOrderField(data.field, data.value);
	}
);

events.on(/contacts\..*:change/,
	(data: { field: keyof OrderForm; value: string }) => {
		orderData.setOrderField(data.field, data.value);
	}
);

// Отправить заказ
events.on('contacts:submit', () => {
	const OrderForServer = {
		...orderData.order,
		items: basketData.basket.items,
		total: basketData.basket.total,
	};

	api.orderProducts(OrderForServer)
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					basketData.clearBasket();
				},
			});
			console.log(result);

			modal.render({
				content: success.render(result),
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокируем прокурутку страницы если модалка закрыта
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем каталог товаров с сервера
api
	.getCardsList()
	.then(orderData.setCatalog.bind(orderData))
	.catch((err) => {
		console.error(err);
	});
