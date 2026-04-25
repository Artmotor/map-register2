// yandex-maps.js - Скрипт для работы с Яндекс.Картами

let mapInstance = null;
let placemark = null;
let circle = null;

// Функция инициализации карты
function initYandexMap(initialLat = 55.751574, initialLng = 37.573856) {
    // Проверяем, загрузился ли API Яндекс.Карт
    if (typeof ymaps === 'undefined') {
        console.log('Ожидание загрузки Яндекс.Карт...');
        setTimeout(() => initYandexMap(initialLat, initialLng), 500);
        return;
    }
    
    ymaps.ready(() => {
        console.log('Яндекс.Карты загружены, создаем карту...');
        
        // Получаем радиус из поля ввода
        const radiusInput = document.getElementById('zoneRadius');
        const radius = radiusInput ? parseInt(radiusInput.value) || 100 : 100;
        
        // Создаем карту
        mapInstance = new ymaps.Map('map', {
            center: [initialLat, initialLng],
            zoom: 17,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
        });
        
        // Создаем метку
        placemark = new ymaps.Placemark([initialLat, initialLng], {
            hintContent: 'Зона доступа',
            balloonContent: 'Перетащите метку для изменения местоположения'
        }, {
            preset: 'islands#redCircleIcon',
            draggable: true
        });
        
        // Создаем круг радиуса
        circle = new ymaps.Circle([
            [initialLat, initialLng],
            radius
        ], {
            balloonContent: `Радиус ${radius} метров`
        }, {
            fillColor: '#3b82f680',
            strokeColor: '#3b82f6',
            strokeWidth: 2,
            fillOpacity: 0.3
        });
        
        // Добавляем объекты на карту
        mapInstance.geoObjects.add(placemark);
        mapInstance.geoObjects.add(circle);
        
        // Обработчик клика по карте
        mapInstance.events.add('click', (e) => {
            const coords = e.get('coords');
            updateMarkerPosition(coords);
        });
        
        // Обработчик перетаскивания метки
        placemark.events.add('dragend', () => {
            const coords = placemark.geometry.getCoordinates();
            updateCirclePosition(coords);
            updateCoordInputs(coords);
        });
        
        // Слушатель изменения радиуса
        if (radiusInput) {
            radiusInput.addEventListener('input', function() {
                const newRadius = parseInt(this.value) || 100;
                updateCircleRadius(newRadius);
            });
        }
        
        // Обновляем поля координат
        updateCoordInputs([initialLat, initialLng]);
        
        console.log('Карта готова');
    });
}

// Обновление позиции метки и круга
function updateMarkerPosition(coords) {
    if (placemark) {
        placemark.geometry.setCoordinates(coords);
        updateCirclePosition(coords);
        updateCoordInputs(coords);
    }
}

// Обновление позиции круга
function updateCirclePosition(coords) {
    if (circle) {
        const radius = circle.geometry.getRadius();
        circle.geometry.setCoordinates([coords, radius]);
    }
}

// Обновление радиуса круга
function updateCircleRadius(radius) {
    if (circle && placemark) {
        const coords = placemark.geometry.getCoordinates();
        circle.geometry.setCoordinates([coords, radius]);
        circle.properties.set('balloonContent', `Радиус ${radius} метров`);
    }
}

// Обновление полей ввода координат
function updateCoordInputs(coords) {
    const latInput = document.getElementById('selectedLat');
    const lngInput = document.getElementById('selectedLng');
    
    if (latInput && lngInput) {
        latInput.value = coords[0].toFixed(6);
        lngInput.value = coords[1].toFixed(6);
    }
}

// Открытие модального окна с картой
function openMapModal() {
    // Получаем текущие координаты из полей ввода
    let lat = parseFloat(document.getElementById('zoneLat')?.value);
    let lng = parseFloat(document.getElementById('zoneLng')?.value);
    
    // Если координаты не заданы, используем центр Москвы
    if (isNaN(lat) || isNaN(lng)) {
        lat = 55.751574;
        lng = 37.573856;
    }
    
    // Показываем модальное окно
    const modalElement = document.getElementById('mapModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Инициализируем карту с небольшой задержкой
        setTimeout(() => {
            if (!mapInstance) {
                initYandexMap(lat, lng);
            } else {
                mapInstance.setCenter([lat, lng], 17);
                if (placemark) {
                    placemark.geometry.setCoordinates([lat, lng]);
                    updateCirclePosition([lat, lng]);
                    updateCoordInputs([lat, lng]);
                }
                // Обновляем радиус
                const radius = parseInt(document.getElementById('zoneRadius')?.value) || 100;
                updateCircleRadius(radius);
            }
        }, 300);
    }
}

// Применение выбранных координат
function applyMapCoordinates() {
    const lat = parseFloat(document.getElementById('selectedLat')?.value);
    const lng = parseFloat(document.getElementById('selectedLng')?.value);
    
    if (!isNaN(lat) && !isNaN(lng)) {
        const latInput = document.getElementById('zoneLat');
        const lngInput = document.getElementById('zoneLng');
        
        if (latInput && lngInput) {
            latInput.value = lat;
            lngInput.value = lng;
            
            // Визуальный feedback
            latInput.style.backgroundColor = '#e8f0fe';
            lngInput.style.backgroundColor = '#e8f0fe';
            setTimeout(() => {
                latInput.style.backgroundColor = '';
                lngInput.style.backgroundColor = '';
            }, 500);
        }
    }
    
    // Закрываем модальное окно
    const modalElement = document.getElementById('mapModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// Навешиваем обработчики после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    const openMapBtn = document.getElementById('openMapBtn');
    if (openMapBtn) {
        openMapBtn.addEventListener('click', openMapModal);
    }
    
    const confirmCoordsBtn = document.getElementById('confirmCoordsBtn');
    if (confirmCoordsBtn) {
        confirmCoordsBtn.addEventListener('click', applyMapCoordinates);
    }
});

// Экспортируем функции в глобальную область для доступа из других скриптов
window.initYandexMap = initYandexMap;
window.openMapModal = openMapModal;
window.applyMapCoordinates = applyMapCoordinates;