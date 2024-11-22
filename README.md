# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), в которой презентер связан как с моделью, так и с отображением данных, но они ничего не знают друг о друге:

— слой представление, который отвечает за отображение данных на странице,

— слой данных, который отвечает за хранение и отправление данных на сервер,

— презентер, отвечающий за связь первых двух слоев (т.е. слоев представления и данных).

1. Класс Api

Данный класс осуществляет работу с базовыми запросами к серверу (GET, POST, PUT, DELETE) и занимается обработкой ответов, полученных от сервера.
Класс имеет методы:
`get` и `post` - для выполнения запросов к серверу,
`handleRespons` - для обработки ответа сервера и обработки ошибок.

2. Класс EventEmitter

Реализует у класса механизм "Слушателя", который позволяет объекту этого класса получать оповещения об изменении состояния других объектов и тем самым наблюдать за ними.
Класс имеет методы `on` , `off` , `emit` — для подписки на событие, отписки от события и уведомления подписчиков о наступлении события соответственно.

События, обрабатываемые классом EventEmitter

- `items:changed` - запускает callback, который формирует карточки товаров (Card); на каждую из карточек устанавливается обработчик события card:select;

- `card:select`- запускает callback, вызывающий метод setPreview, который, в свою очередь, запускает обработчик событие preview:changed;

- `preview:changed` - запускает callback, который берет id карточки, запрашивает по нему всю информацию о выбранном товаре, формирует превью и с помощью Modal.render() выводит на экран попап с выбранным товаром; на кнопку добавления товара в корзину вешается слушатель клика, который проверяет есть ли заказ в корзине, если нет - добавляет его в корзину, если, если есть - удаляет;

- `basket:open` - запускает callback, который запрашивает у класса AppStatus актуальное состояние корзины, с помощью Modal.render() выводит на экран попап с содежимым корзины; на кнопку Оформить вешается слушатель клика, на кнопку закрытия попапа (крестик) вешается слушатель клика, по которому попап закрывается;

- `basket:changed` - запускает callback, который запрашивает у класса BasketData список товаров в корзине; Обновляет счетчик корзины, увеличивает количество товара в корзине и общую стоимость корзины; Обновляет общую стоимость корзины;

- `order:open` - запускает callback, который с помощью Modal.render() и данных класса Order формирует и отображает модальное окно с формой ввода адреса доставки и выбора способа оплаты; на кнопки выбора способа оплаты вешается слушатель, запускающий событие payment:changed, которое, в свою очередь, записывает выбранный способ оплаты в OrderData.order.payment, на кнопку закрытия (крестик) вешается слушатель, который закрывает модальное окно и очищается форму ввода адреса доставки и выбранный способ оплаты;

- `FormErrors:change` - запускает callback, который записывает данные в OrderData.order.payment, OrderData.order.address, OrderData.order.email, OrderData.order.phone а так же валидирует поля ввода с помощью метода validateForm(); на кнопку Далее вешается слушатель сабмита формы, запускающий событие order:submit в случае, если валидация поля прошла успешно;

- `order:submit` - запускает callback, который с помощью Modal.render() и данных класса Contacts формирует и отображает модальное окно с формой ввода телефона и адреса электронной почты; на кнопку закрытия попапа устанавливается слушатель события клика, который закрывает модальное окно, очищая при этом поля ввода формы контактов и формы доставки;

- `contacts:submit` - запускает callback, отправляющий сформированный объект заказа на сервер и, получив ответ об успешном оформлении заказа, очищает корзину и все формы заказа, сбрасывает состояние выбора способа оплаты.

- `modal:open` - блокирует контент на странице под модальным окном;

- `modal:close` - разблокирует контент на странице под модальным окном.

3. Класс Model

Базовый класс, предназначенный для создания модельных данных, используемых для управления данными приложения. Напрямую "общается" с EventEmitter, принимая в конструктор данные модели и аргумент `events`.
Включает в себя только один метод:
`emitChanges` - для сообщения всем подписчикам о том, что модель изменилась.

4. Класс Component

Базовый класс, который наследуется всеми компонентами - страница, корзина, карточки товаров, модальные окна. Назначение - создание HTML элементов и управление их свойствами.

В состав класса входят методы:

- `toggleClass` - для переключения класса конкретного DOM-элемента,

- `setImage` - для установки изображения (src) и альтернативного текста (alt) для конкретного DOM-элемента,

- `setVisible` - для показа конкретного DOM-элемента,

- `setHidden` - для скрытия конкретного DOM-элемента,

- `setText` - для установки текста в свойство textContent конкретного DOM-элемента,

- `setDisabled` - для "отключения" переданного DOM-элемента,

- `render` - для генерации компонента и "отрисовки" его в разметке.

## Компоненты модели данных

Класс CardData для хранения актуального состояния приложения: данные о товаре и превью. 

Свойства:

- `items` - массив элементов каталога товаров,

- `preview` - ID предпросмотренного товара,

Методы класса:

- `setCatalog` - для отрисовки каталога товаров,

- `setPreview` - для открытия предпросмотра товара,

- `getOrderId` - для получения ID всех элементов в заказе.

Класс OrderData для хранения актуального состояния приложения: данные о заказе и ошибках. 

Свойства:

- `order` - Данные о заказе, включая email, телефон, адрес, способ оплаты и выбранные товары,

Методы класса:

- `setPayment` - для установки способа оплаты,

- `validateForm()` - для валидации формы данных по оплате, доставке и контактах

- `setOrderField` - для установки значений полей в объекте заказа и проверки корректности формы.

Класс BasketData для хранения актуального состояния корзины.

Свойства:

- `items` - массив элементов добавленных в корзину,

- `total` - общая цена товаров в корзине,

Методы класса:

- `ProductinBasket` - проверяет наличие товара в корзине,

- `addBasket` - для добавления товара в корзину,

- `deleteBasket` - для удаления товара из корзины,

- `clearBasket` - очищает корзину,

- `updateBasket` - отвечает за обновление состояния корзины в зависимости от того, добавляется товар или удаляется.

- `emitBasketChange` - обеспечивает уведомление об изменениях в корзине,

- `isValidItem` - гарантирует, что только допустимые товары будут обработаны.

## Компоненты представления

Возможные классы для реализации в будущем:

1. Класс `Page` - для отображения элементов страницы (карточек товара, корзины и т.д.), задаёт:

   `_counter: HTMLElement`- элемент отображения количества товаров в корзине,

   `_catalog: HTMLElement` - элемент отображения всех доступных карточек,

   `_wrapper: HTMLElement` - обёртка, позволяющая блокировать прокрутку страницы при открытии модального окна,

   `_basket: HTMLButtonElement` - кнопка для отображения корзины. 

  Методы:

    `set counter` - Устанавливаем количество лотов в корзине,

    `set catalog` - Обновляем список карточек,

    `set locked` - Обрабатываем блокировку страницы.

2. Класс `Card` - карточка товара, задаёт:

   `_index: HTMLElement` - элемент отображения индекса товара,

   `_title: HTMLElement` - элемент отображения названия,

   `_image: HTMLImageElement` - элемент отображеня изображения,

   `_description: HTMLElement` - элемент отображения описания,

   `_button: HTMLButtonElement` - элемент отображения кнопки,

   `_price: HTMLElement` - элемент отображения стоимости,

   `_category: HTMLElement` - элемент отображения категории.

  Методы:

    `get id` - получение id,

    `set id` - установка id,

    `set title` - установка названия карточки,

    `get title` - получение названия карточки,

    `set category` - установка категории,

    `set image` - установка картинка карточки,

    `set description` - установка описания карточки,

    `set price` - установка цены,

    `set button` - установка текста на кнопке.

    `set index` - установка кол-ва товаров в корзине,

3. Класс `Basket` - корзина товара/товаров, задаёт:

   `_list: HTMLElement` - список элементов в корзине,

   `_total: HTMLElement` - общую ценность корзины,

   `_button: HTMLButtonElement` - кнопку открытия формы оформления заказа,

   Методы:

   `set items` - используется для добавления карточки в корзину,

   `set total` - устанавливается значение общей суммы товаров корзины,

4. Класс `Modal` - универсальное модальное окно, задаёт:

   `_content: HTMLElement` - для отображения внутреннего содержания модального окна,

   `_closeButton: HTMLButtonElement` - для отображения кнопки закрытия модального окна. 

  Методы:

    `set content` - установка содержимого,

    `open` - Показываем модальное окно,

    `close` - Закрываем модальное окно,

    `render(data: IModalData): HTMLElement` - Используется для сборки окна.

5. Класс `Form` - форма оформления заказа (поля ввода, валидация формы, подтверждения), задаёт:

   `_submit: HTMLButtonElement` - кнопку отправки формы,

   `_errors: HTMLElement` - блок отображения ошибок в форме.

  Методы:

   `onInputChange` - генерирует событие изменения для поля формы, передавая имя поля и его новое значение.

    `set valid` - сеттер для блокировки кнопки, если в поле нет данных,

    `set errors` - сеттер для установки текстового значения ошибки.

   `render` - обновляет состояние формы, включая валидность и ошибки, а также обновляет значения полей ввода,

6. Интерфейс `Order` - наследуется от класса `Form`. Отображает форму оформления заказа с информацией о способе оплаты и адреса доставки, задаёт:

   `payment` - способ оплаты,

   `address` - адрес доставки.

  Методы:

    `set changePayment` - используется для изменения способа оплаты,

    `set address` - используется для добавления адресса.

7. Класс `Contacts` - наследуется от класса `Form`. Отображает форму оформления заказа с контактной информацией, задаёт:

   `email: HTMLInputElement` - почта для связи,

   `phone: HTMLInputElement` - телефон для связи.

  Методы:

    `set phone` - имеет тип string, используется для добавления телефона,

    `set email` - имеет тип string, используется для добавления емайла.

8. класс `Success` - отображает информационное сообщение об успешной покупке, задаёт:

   `_close: HTMLElement` - элемент для закрытия страницы,

   `_total: HTMLElement` - элемент для отображения общей стоимости заказа.

  Метод:

    `set total` - установка общей стоимости заказа.
