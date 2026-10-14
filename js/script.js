// ==========================================================================
// ПРАКТИКУМ №6: ПОЧАТКОВІ ДАНІ ТА ФУНКЦІЇ ОБРОБКИ МАСИВУ
// ==========================================================================

// Початковий масив подорожей
const initialTrips = [
    {
        id: '1',
        destination: 'Париж, Франція', 
        startDay: '15.06.2026', 
        endDay: '22.06.2026', 
        days: 7, 
        budget: 1200, 
        status: '✈️ Заплановано',
        badgeClass: 'badge--planned',
        imgSrc: 'assets/img/paris.jpg',
        imgAlt: 'Вид на Ейфелеву вежу ввечері'
    },
    {
        id: '2',
        destination: 'Рим, Італія', 
        startDay: '10.09.2026', 
        endDay: '18.09.2026', 
        days: 8, 
        budget: 1500, 
        status: '⏳ В процесі бронювання',
        badgeClass: 'badge--in-progress',
        imgSrc: 'assets/img/rome.jpg',
        imgAlt: 'Колізей у Римі під сонячним промінням'
    },
    {
        id: '3',
        destination: 'Барселона, Іспанія', 
        startDay: '05.10.2026', 
        endDay: '12.10.2026', 
        days: 7, 
        budget: 900, 
        status: '✈️ Заплановано',
        badgeClass: 'badge--planned',
        imgSrc: 'assets/img/barcelona.jpg',
        imgAlt: 'Храм Святого Сімейства в Барселоні'
    },
    {
        id: '4',
        destination: 'Відень, Австрія', 
        startDay: '07.10.2026', 
        endDay: '09.10.2026', 
        days: 2, 
        budget: 750, 
        status: '✅ Завершено',
        badgeClass: 'badge--completed',
        imgSrc: 'assets/img/wien.jpg',
        imgAlt: 'Панорама Відня'
    }
];

// Обчислення денного бюджету подорожі
const costPerDay = trip => Math.round(trip.budget / trip.days);

// Консольне виведення оброблених даних
function processTrips(tripList) {
    console.log('Список подорожей:');
    for (const trip of tripList) {
        let category = trip.budget < 1000 ? 'дешева' : 'дорога';
        const dailyCost = costPerDay(trip);
        console.log(
            `Куди: ${trip.destination} | Тривалість: ${trip.days} днів. ` +
            `Загальний бюджет: $${trip.budget} (${category}) | ` +
            `Витрати на день: ~$${dailyCost}`
        );
    }
}
processTrips(initialTrips);


// ==========================================================================
// ПРАКТИКУМ №8: ВАЛІДАЦІЯ ФОРМИ ТА ДИНАМІЧНИЙ ПЕРЕРАХУНОК
// ==========================================================================

const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const budgetInput = document.querySelector("#budget");
const calculatedDaysVal = document.querySelector("#calculated-days-val");
const dailyBudgetVal = document.querySelector("#daily-budget-val");

// Динамічний перерахунок тривалості та середніх витрат на день
function updateTripMetrics() {
    if (!startDateInput || !endDateInput || !budgetInput) return;
    const startVal = startDateInput.value;
    const endVal = endDateInput.value;
    const budgetVal = Number(budgetInput.value);

    if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);

        if (end < start) {
            endDateInput.setCustomValidity("Дата завершення не може бути раніше дати початку!");
            if (calculatedDaysVal) calculatedDaysVal.textContent = "0";
            if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
            return;
        } else {
            endDateInput.setCustomValidity("");
        }

        const diffInMs = end - start;
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1; 

        if (calculatedDaysVal) calculatedDaysVal.textContent = diffInDays;

        if (budgetVal > 0) {
            const dailyCost = Math.round(budgetVal / diffInDays);
            if (dailyBudgetVal) dailyBudgetVal.textContent = dailyCost;

            if (dailyCost < 20) {
                budgetInput.setCustomValidity("Бюджет на день занадто малий (менше 20€/день)!");
            } else {
                budgetInput.setCustomValidity("");
            }
        } else {
            if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
            budgetInput.setCustomValidity("");
        }
    } else {
        if (calculatedDaysVal) calculatedDaysVal.textContent = "0";
        if (dailyBudgetVal) dailyBudgetVal.textContent = "0";
    }
}

if (startDateInput) startDateInput.addEventListener("input", updateTripMetrics);
if (endDateInput) endDateInput.addEventListener("input", updateTripMetrics);
if (budgetInput) budgetInput.addEventListener("input", updateTripMetrics);


// ==========================================================================
// ПРАКТИКУМ №9: REST COUNTRIES API ІНТЕГРАЦІЯ
// ==========================================================================

const REST_COUNTRIES_API_URL = 'https://restcountries.com/v3.1/name/';

// Динамічне створення блоку керування API
const apiControlsWrapper = document.createElement('div');
apiControlsWrapper.className = 'api-controls-container';
apiControlsWrapper.style.cssText = 'margin: 15px 0; padding: 15px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;';

apiControlsWrapper.innerHTML = `
    <h3 style="margin-top: 0; color: #0056b3;">Пошук інформації про країну (REST Countries API)</h3>
    <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
        <input type="text" id="api-country-input" placeholder="Введіть назву країни англійською (наприклад: France, Ukraine, Japan)" style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <button type="button" id="api-fetch-btn" style="padding: 8px 15px; background-color: #008080; color: white; border: none; border-radius: 4px; cursor: pointer;">Завантажити країну</button>
        <button type="button" id="api-refresh-btn" style="padding: 8px 15px; background-color: #008080; color: white; border: none; border-radius: 4px; cursor: pointer;">Оновити</button>
    </div>
    <div id="api-loading-state" style="display: none; color: #0056b3; font-weight: bold; margin: 5px 0;">
        ⏳ Завантаження даних з сервера...
    </div>
    <div id="api-error-display" style="display: none; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; border-radius: 4px; margin: 5px 0;">
    </div>
`;

const tripsSectionContainer = document.querySelector('#trips');
const cardsDiv = document.querySelector('#cards');
if (tripsSectionContainer && cardsDiv) {
    tripsSectionContainer.insertBefore(apiControlsWrapper, cardsDiv);
}

const apiCountryInput = apiControlsWrapper.querySelector('#api-country-input');
const apiFetchBtn = apiControlsWrapper.querySelector('#api-fetch-btn');
const apiRefreshBtn = apiControlsWrapper.querySelector('#api-refresh-btn');
const apiLoadingState = apiControlsWrapper.querySelector('#api-loading-state');
const apiErrorDisplay = apiControlsWrapper.querySelector('#api-error-display');

// Індикація стану завантаження API
function setApiLoading(isLoading) {
    if (isLoading) {
        if (apiLoadingState) apiLoadingState.style.display = 'block';
        if (apiFetchBtn) apiFetchBtn.disabled = true;
        if (apiRefreshBtn) apiRefreshBtn.disabled = true;
        clearApiError();
    } else {
        if (apiLoadingState) apiLoadingState.style.display = 'none';
        if (apiFetchBtn) apiFetchBtn.disabled = false;
        if (apiRefreshBtn) apiRefreshBtn.disabled = false;
    }
}

// Відображення помилки API
function displayApiError(message) {
    if (apiErrorDisplay) {
        apiErrorDisplay.textContent = message;
        apiErrorDisplay.style.display = 'block';
    }
}

// Очищення повідомлень про помилки
function clearApiError() {
    if (apiErrorDisplay) {
        apiErrorDisplay.textContent = '';
        apiErrorDisplay.style.display = 'none';
    }
}


// ==========================================================================
// ПРАКТИКУМ №11: ІНТЕГРАЦІЯ З INDEXEDDB ТА LOCALSTORAGE
// ==========================================================================

const DB_NAME = 'TravelPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tripStops';
const LS_KEY = 'legacy_trip_stops';
const MIGRATED_KEY = 'migrated_to_indexeddb';

// Збереження даних у localStorage
function saveToLocalStorage(items) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Помилка збереження в localStorage:', error);
    }
}

// Зчитування даних із localStorage
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Пошкоджені дані в localStorage:', error);
        return [];
    }
}

// Відкриття та ініціалізація бази даних IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            return reject(new Error('IndexedDB не підтримується у вашому браузері'));
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Запис або оновлення елемента в IndexedDB
async function saveItemDB(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Отримання всіх елементів із IndexedDB
async function getAllItemsDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(tx.error);
    });
}

// Видалення елемента з IndexedDB
async function deleteItemDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Міграція застарілих даних із localStorage у IndexedDB
async function migrateFromLocalStorageIfNeeded() {
    const isMigrated = localStorage.getItem(MIGRATED_KEY);
    if (isMigrated) return;

    let legacyData = loadFromLocalStorage();
    if (legacyData.length === 0) {
        legacyData = initialTrips;
        saveToLocalStorage(legacyData);
    }

    console.log('Початок одноразової міграції даних із localStorage у IndexedDB...');
    for (const item of legacyData) {
        await saveItemDB(item);
    }
    console.log('Міграцію успішно завершено.');

    localStorage.setItem(MIGRATED_KEY, 'true');
}


// ==========================================================================
// ПРАКТИКУМ №12: ГЛОБАЛЬНІ ЗМІННІ ДЛЯ CANVAS-АНІМАЦІЇ
// ==========================================================================

// Ідентифікатор активного кадру анімації для можливості скасування (cancelAnimationFrame)
let routeAnimId = null;


// ==========================================================================
// ПРАКТИКУМ №10: ДЕКЛАРАТИВНІ КОМПОНЕНТИ ТА РЕАКТИВНИЙ СТАН VUE 3
// ==========================================================================

// Декларативний компонент картки подорожі
const TripCard = {
    props: {
        id: [String, Number],
        destination: String,
        days: Number,
        budget: Number,
        startDay: String,
        endDay: String,
        status: String,
        badgeClass: String,
        imgSrc: String,
        imgAlt: String,
        isApiData: Boolean,
        capital: String,
        population: Number
    },
    emits: ['select-trip', 'delete-trip'],
    computed: {
        costPerDay() {
            if (!this.days || this.days <= 0) return 0;
            return Math.round(this.budget / this.days);
        }
    },
    template: `
        <article class="card" :class="budget ? (budget < 1000 ? 'budget' : 'expensive') : ''" @click="$emit('select-trip')">
            <h3>{{ destination }}</h3>
            <img v-if="imgSrc" :src="imgSrc" :alt="imgAlt || destination">
            
            <p v-if="isApiData">
                Столиця: <strong>{{ capital }}</strong><br>
                Населення: <strong>{{ population ? population.toLocaleString('uk-UA') : 0 }}</strong> осіб
            </p>
            <p v-else>
                Дати: {{ startDay }} – {{ endDay }} ({{ days }} днів, €{{ budget }})<br>
                <small>Витрати на день: ~€{{ costPerDay }}</small>
            </p>

            <span class="badge" :class="badgeClass">{{ status }}</span>
            <button type="button" class="btn-delete" style="margin-top: 8px; background-color: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;" @click.stop="$emit('delete-trip')">Видалити</button>
        </article>
    `
};

// Головний екземпляр додатка Vue 3
const app = Vue.createApp({
    components: {
        TripCard
    },
    data() {
        return {
            trips: [],
            selectedTrip: null
        };
    },
    methods: {
        selectTrip(trip) {
            this.selectedTrip = trip;
        },
        async addTripFromForm(newTrip) {
            await saveItemDB(newTrip);
            await this.loadTripsFromDB();
        },
        async addTripFromApi(apiTrip) {
            await saveItemDB(apiTrip);
            await this.loadTripsFromDB();
        },
        async deleteTrip(id) {
            if (!confirm('Видалити цей пункт маршруту?')) return;
            try {
                await deleteItemDB(id);
                if (this.selectedTrip && this.selectedTrip.id === id) {
                    this.selectedTrip = null;
                }
                await this.loadTripsFromDB();
            } catch (error) {
                console.error('Помилка видалення з IndexedDB:', error);
            }
        },
        async loadTripsFromDB() {
            try {
                const items = await getAllItemsDB();
                
                // Сортування масиву за датою початку подорожі
                items.sort((a, b) => {
                    if (!a.startDay || !b.startDay) return 0;
                    const dateA = a.startDay.split('.').reverse().join('-');
                    const dateB = b.startDay.split('.').reverse().join('-');
                    return new Date(dateA) - new Date(dateB);
                });
                
                this.trips = items;

                // ПРАКТИКУМ №12: Перемальовування Canvas-карти при зміні списку даних
                this.$nextTick(() => {
                    this.drawRouteMap();
                });
            } catch (error) {
                console.error('Помилка завантаження з IndexedDB:', error);
            }
        },

        // ==========================================================================
        // ПРАКТИКУМ №12: РЕНДЕР ТА АНІМАЦІЯ CANVAS-КАРТИ МАРШРУТУ
        // ==========================================================================
        drawRouteMap() {
            const canvas = document.getElementById('routeCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            // Крок 8: Скасування попередньої анімації, якщо вона виконується
            if (routeAnimId) {
                cancelAnimationFrame(routeAnimId);
                routeAnimId = null;
            }

            // Крок 4: Формування масиву точок на основі реальних даних із масиву подорожей
            const validTrips = this.trips.filter(t => !t.isApiData);

            if (validTrips.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#028090';
                ctx.font = '15px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Додайте подорожі, щоб побудувати інтерактивний маршрут', canvas.width / 2, canvas.height / 2);
                return;
            }

            // Динамічний розрахунок координат (X, Y) для точок зупинок на полотні Canvas
            const padding = 70;
            const stepX = validTrips.length > 1 ? (canvas.width - padding * 2) / (validTrips.length - 1) : 0;
            
            const points = validTrips.map((trip, idx) => ({
                x: validTrips.length === 1 ? canvas.width / 2 : padding + idx * stepX,
                y: 120 + (idx % 2 === 0 ? -35 : 35), // Хвилеподібна лінія для візуальної виразності
                title: trip.destination.split(',')[0],
                dates: trip.startDay ? trip.startDay.slice(0, 5) : ''
            }));

            let progress = 0; // Початковий прогрес анімації (від 0 до 1)

            // Крок 5: Цикл анімації через requestAnimationFrame
            const animate = () => {
                // Крок 5: Обов'язкове очищення полотна перед малюванням нового кадру
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 1. Малювання з'єднувальної пунктирної лінії маршруту
                if (points.length > 1) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = '#028090';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([6, 6]);
                    ctx.moveTo(points[0].x, points[0].y);

                    for (let i = 1; i < points.length; i++) {
                        const segmentProgress = Math.min(Math.max((progress - (i - 1) / (points.length - 1)) * (points.length - 1), 0), 1);
                        const currentX = points[i - 1].x + (points[i].x - points[i - 1].x) * segmentProgress;
                        const currentY = points[i - 1].y + (points[i].y - points[i - 1].y) * segmentProgress;
                        ctx.lineTo(currentX, currentY);
                    }
                    ctx.stroke();
                    ctx.restore();
                }

                // 2. Малювання точок (міст) та підписів
                points.forEach((pt, index) => {
                    const threshold = index / Math.max(points.length - 1, 1);
                    if (progress >= threshold || points.length === 1) {
                        ctx.save();
                        
                        // Зовнішній пульсуючий ореол для активної точки
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(244, 162, 97, 0.3)';
                        ctx.fill();

                        // Маркер міста
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
                        ctx.fillStyle = '#f4a261';
                        ctx.fill();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = '#028090';
                        ctx.stroke();

                        // Назва міста
                        ctx.fillStyle = '#2c3e50';
                        ctx.font = 'bold 13px system-ui';
                        ctx.textAlign = 'center';
                        ctx.fillText(pt.title, pt.x, pt.y - 16);

                        // Дата поїздки під точкою
                        if (pt.dates) {
                            ctx.fillStyle = '#00a896';
                            ctx.font = '11px system-ui';
                            ctx.fillText(pt.dates, pt.x, pt.y + 20);
                        }

                        ctx.restore();
                    }
                });

                // Крок 5: Запит наступного кадру анімації
                if (progress < 1) {
                    progress += 0.025; // Швидкість наростання анімації
                    routeAnimId = requestAnimationFrame(animate);
                }
            };

            // Запуск анімаційного циклу
            animate();
        }
    },
    async mounted() {
        await migrateFromLocalStorageIfNeeded();
        await this.loadTripsFromDB();
    }
});

const vm = app.mount('#app');


// ==========================================================================
// ОБРОБКА ФОРМИ ДОДАВАННЯ ПОДОРОЖІ
// ==========================================================================

const travelForm = document.querySelector('#travel-form');
const destinationInput = document.querySelector('#destination');

if (travelForm) {
    travelForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const startParts = startDateInput.value.split('-');
        const endParts = endDateInput.value.split('-');

        const formattedStart = `${startParts[2]}.${startParts[1]}.${startParts[0]}`;
        const formattedEnd = `${endParts[2]}.${endParts[1]}.${endParts[0]}`;

        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const newTrip = {
            id: Date.now().toString(),
            destination: destinationInput.value.trim(),
            startDay: formattedStart,
            endDay: formattedEnd,
            days: daysCount,
            budget: Number(budgetInput.value),
            status: '✈️ Заплановано',
            badgeClass: 'badge--planned',
            imgSrc: 'assets/img/barcelona.jpg',
            imgAlt: destinationInput.value.trim()
        };

        const currentLsData = loadFromLocalStorage();
        saveToLocalStorage([...currentLsData, newTrip]);

        await vm.addTripFromForm(newTrip);

        travelForm.reset();
        if (calculatedDaysVal) calculatedDaysVal.textContent = '0';
        if (dailyBudgetVal) dailyBudgetVal.textContent = '0';
    });
}


// ==========================================================================
// ОБРОБКА ЗАПИТІВ ДО REST COUNTRIES API
// ==========================================================================

async function loadCountryData() {
    const searchQuery = apiCountryInput ? apiCountryInput.value.trim() : '';

    if (!searchQuery) {
        displayApiError('Будь ласка, введіть назву країни англійською мовою.');
        return;
    }

    setApiLoading(true);

    try {
        const response = await fetch(`${REST_COUNTRIES_API_URL}${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Країну не знайдено, перевірте написання.');
            }
            throw new Error(`Сервер відповів кодом ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Країну не знайдено, перевірте написання.');
        }

        const country = data[0];

        const countryCardData = {
            id: Date.now().toString(),
            destination: country.name?.common || searchQuery,
            capital: (country.capital && country.capital.length > 0) ? country.capital[0] : 'Не вказано',
            population: country.population ? country.population : 0,
            imgSrc: country.flags?.png || country.flags?.svg || '',
            imgAlt: `Прапор ${country.name?.common || searchQuery}`,
            status: '🌐 Дані з API',
            badgeClass: 'badge--planned',
            isApiData: true
        };

        await vm.addTripFromApi(countryCardData);

    } catch (error) {
        console.error('Помилка під час виконання fetch-запиту:', error);
        displayApiError(error.message);
    } finally {
        setApiLoading(false);
    }
}

if (apiFetchBtn) apiFetchBtn.addEventListener('click', loadCountryData);
if (apiRefreshBtn) apiRefreshBtn.addEventListener('click', loadCountryData);

if (apiCountryInput) {
    apiCountryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadCountryData();
        }
    });
}