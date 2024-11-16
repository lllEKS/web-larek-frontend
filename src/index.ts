import './scss/styles.scss';

import { AppStatus, ProductItem } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { LarekApi } from './components/LarekAPI';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IOrderFormContacts, IOrder, IOrderFormDelivery } from './types';
import { Basket } from './components/Basket';
import { Order, PaymentMethods } from './components/Order';
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
const appData = new AppStatus({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events, {
	onClick: (event: Event) => events.emit('payment:changed', event.target),
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Вывод каталога товаров на главную страницу
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
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
events.on('card:select', (item: ProductItem) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		// Удалить или добавить товар в корзину
		onClick: () => {
			events.emit('item:toggle', item);
			page.counter = appData.getBasketList().length;
			card.buttonText = item.status;
		},
	});
	return modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			buttonText: item.status,
		}),
	});
});

// Открытие корзины
events.on('basket:open', () => {
	basket.items = appData.getBasketList().map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
				console.log(events);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	page.counter = appData.getBasketList().length;
	basket.valid = appData.getBasketList();
	basket.total = appData.getTotal();
	appData.order.total = appData.getTotal();
	// console.log(appData.order.total);
	return modal.render({
		content: basket.render(),
	});
});

// Удаление из корзины
events.on('item:toggle', (item: ProductItem) => {
	appData.toggleBasketList(item);
	page.counter = appData.getBasketList().length;
});

// Изменилось состояние корзины
events.on('basket:changed', (items: ProductItem[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	appData.order.total = appData.getTotal();
	basket.total = appData.getTotal();
});

// Форма заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Смена способа оплаты
events.on('payment:changed', (target: HTMLElement) => {
	if (!target.classList.contains('button_alt-active')) {
		order.changePayment(target);
		appData.order.payment = PaymentMethods[target.getAttribute('name')];
	}
});

// Изменилось состояние валидации формы заказа
events.on('FormValidateErrorsDelivery:change', (errors: Partial<IOrder>) => {
	const { address } = errors;
	order.valid = !address;
	order.errors = Object.values({ address }).filter(Boolean).join('; ');
});

// Изменилось одно из полей формы заказа
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderFormDelivery; value: string }) => {
		appData.setDeliveryField(data.field, data.value);
	}
);

// Отправка формы доставки
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
	appData.order.items = appData.basket.map((item) => item.id);
});

// Изменилось одно из полей формы контактов
events.on(
	/^contacts\.[^:]*:change/,
	(data: { field: keyof IOrderFormContacts; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

// Изменилось состояние валидации формы контактов
events.on('FormValidateErrorsContacts:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
});

// Завершения оплаты
events.on('contacts:submit', () => {
	api.orderProducts(appData.order)
		.then((result) => {
			appData.clearBasket();
			page.counter = appData.getBasketList().length;
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			console.log(result);
			success.total = result.total;

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем каталог товаров с сервера
api.getCardsList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
