// Интерфейсы моделей данных
export interface IAppStatus {
	catalog: ICard[];
	basket: ICard[];
	preview: string | null;
	delivery: IOrderFormDelivery | null;
	contact: IContacts | null;
	order: IOrder | null;
}

// Интерфейс описания главной страницы
export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

// Интерфейс описание товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Интерфейс описание карточки товара
export interface ICard extends IProductItem {
	buttonText: string;
	itemCount: number | string;
}

export interface IActions {
	onClick: (event: MouseEvent) => void;
}

// Модальное окно
export interface IModalData {
	content: HTMLElement;
}

export type PaymentMethod = 'online' | 'cash';

// Типа оплаты и адреса доставки
export interface IOrderFormDelivery {
	payment: string;
	address: string;
}

// Контактные данные
export interface IOrderFormContacts {
	email: string;
	phone: string;
}

// Список товаров
export interface IOrder extends IOrderFormDelivery, IOrderFormContacts {
	total: number | null;
	items: string[];
}

export interface IContacts extends IOrderFormContacts {
	items: string[];
}

export interface IOrderSuccess {
	id: string;
	total: number | null;
}

// Оформление заказа
export interface ISuccess {
	image: string;
	title: string;
	description: string;
	total: number | null;
}

export interface ISuccessActions {
	onClick: () => void;
}

// Корзина
export interface IBasket {
	items: HTMLElement[];
	total: number | string;
	selected: string[];
}

// Состояние полей формы
export interface IFormState {
	valid: boolean;
	errors: string[];
}

export type FormValidateErrorsDelivery = Partial<Record<keyof IOrder, string>>;
export type FormValidateErrorsContacts = Partial<Record<keyof IContacts, string>>;

