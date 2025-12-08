# Tahirov Engine

**Клиентское веб-приложение для генерации и экспорта интерактивных презентаций из структурированных данных.**

---

## Аннотация

Tahirov Engine — это модульная система рендеринга презентаций, работающая полностью на стороне клиента (client-side). Движок преобразует декларативные данные в формате JSON в визуально насыщенные слайды с поддержкой мгновенной смены тем, адаптивной типографики и экспорта в форматы PDF и PPTX.

**Ключевые особенности:**
- Модульная архитектура с разделением ответственности (Core, Templates, Data)
- Две встроенные темы: Liquid Glass (темная) и Material You (светлая)
- Гибридный экспорт в PPTX: растровый фон + векторный текст
- Типографическая обработка текста (неразрывные пробелы)
- Управление через горячие клавиши и UI-кнопки
- Адаптивный дизайн для десктопа и мобильных устройств

---

## Архитектура

### Принципы построения

Проект следует паттерну **Modular Monolith** — монолитное приложение с четким разделением на слои:

```
┌─────────────────────────────────────┐
│          index.html (Shell)         │
│   Точка входа, UI-кнопки, стили     │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │   Engine.js (Core)  │
    │  Главный контроллер │
    └──┬─────────┬────────┘
       │         │
  ┌────▼───┐ ┌──▼──────────┐
  │ Theme  │ │  Exporters  │
  │Manager │ │ PDF / PPTX  │
  └────────┘ └─────────────┘
       │
    ┌──▼─────────────────┐
    │  Template Renders  │
    │ CardsSlide, Section│
    └────────────────────┘
       │
    ┌──▼──────┐
    │  Data   │
    │  JSON   │
    └─────────┘
```

### Слои системы

**1. Core (Ядро)**
- `Engine.js` — контроллер приложения, управление состоянием и событиями
- `ThemeManager.js` — переключение тем через CSS Custom Properties
- `Exporter.js` — экспорт в PDF через iframe + html-to-image
- `PptxExporter.js` — экспорт в PPTX (гибридный рендеринг)

**2. Templates (Шаблоны)**
- `CardsSlide.js` — слайд с сеткой карточек 3×n
- `SectionSlide.js` — титульный слайд раздела с центрированным заголовком
- `Typography.js` — утилита для типографической обработки текста

**3. Data (Данные)**
- `my-presentation.js` — сценарий презентации в формате JSON
- `icons.js` — библиотека SVG-иконок с градиентами

**4. Styles (Стили)**
- `main.css` — глобальные стили и CSS-переменные
- `modules/layout.css` — сетка, адаптивность, стили сцены экспорта
- `modules/components.css` — UI-компоненты (кнопки, карточки, футер)
- `tokens/theme-*.css` — темы оформления (Glass, Material, Print)

---

## Структура проекта

```
tahirov-engine/
├── index.html                  # Shell приложения
├── README.md                   # Документация
├── assets/                     # Шрифты, логотипы (опционально)
│
├── src/
│   ├── core/
│   │   ├── Engine.js           # Главный контроллер
│   │   ├── ThemeManager.js     # Управление темами
│   │   ├── Exporter.js         # PDF экспорт
│   │   └── PptxExporter.js     # PPTX экспорт
│   │
│   ├── templates/
│   │   ├── slides/
│   │   │   ├── CardsSlide.js   # Шаблон слайда с карточками
│   │   │   └── SectionSlide.js # Шаблон титульного слайда
│   │   └── utils/
│   │       └── Typography.js   # Типографическая утилита
│   │
│   └── data/
│       ├── my-presentation.js  # JSON-сценарий презентации
│       └── icons.js            # SVG-иконки
│
└── styles/
    ├── main.css                # Глобальные стили
    ├── modules/
    │   ├── layout.css          # Сетка и адаптивность
    │   └── components.css      # Компоненты и UI
    └── tokens/
        ├── theme-glass.css     # Темная тема (Liquid Glass)
        ├── theme-material.css  # Светлая тема (Material You)
        └── theme-print.css     # Печатная тема (Eco)
```

---

## Дизайн-система

### Токенизация через CSS Custom Properties

Движок использует систему **Design Tokens** для управления визуальным языком. Все темы определяют набор переменных:

```
/* Основные цвета */
--text-main          /* Основной текст */
--text-secondary     /* Вторичный текст */
--accent-primary     /* Основной акцент */
--accent-secondary   /* Вторичный акцент */

/* Поверхности */
--surface-bg         /* Фон карточек */
--surface-border     /* Обводка */
--surface-blur       /* Blur эффект */
--surface-shadow     /* Тени */

/* Фоны */
--bg-color           /* Основной фон */
--bg-image           /* Фоновое изображение */
--blob-color-1/2     /* Цвета декоративных пятен */
```

### Темы

**1. Liquid Glass (theme-glass.css)**
- Темный фон с градиентным шумом
- Glassmorphism эффект для карточек
- Электрические акценты (#0099ff, #8a00d4)
- Декоративные размытые пятна (blobs)

**2. Material You (theme-material.css)**
- Светлый фон с пастельными оттенками
- Мягкие тени и минимализм
- Теплые акценты (#ff6b6b, #4ecdc4)
- Меньшая насыщенность blur-эффектов

**3. Print Eco (theme-print.css)**
- Белый фон без декораций
- Черный текст для экономии чернил
- Упрощенные границы

### Типографика

**Шрифты:**
- **Unbounded** (Headings) — геометрический гротеск для заголовков
- **Raleway** (Body) — гуманистический гротеск для текста

**Адаптивная система:**
- Использование `clamp()` для плавной интерполяции размеров
- Пример: `font-size: clamp(24px, 4vw, 3.5rem)`

**Типографическая обработка:**
- Функция `typo()` предотвращает висячие предлоги
- Замена пробелов после слов из 1-2 букв на `&nbsp;`

---

## Как это работает

### Жизненный цикл приложения

**1. Инициализация (index.html)**
```
<!-- Загрузка библиотек -->
<script src="html-to-image.js"></script>
<script src="jspdf.umd.min.js"></script>
<script src="pptxgen.bundle.js"></script>

<!-- Запуск движка -->
<script type="module" src="./src/core/Engine.js"></script>
```

**2. Загрузка данных (Engine.js)**
```
import { presentationData } from '../data/my-presentation.js';
this.data = presentationData;
```

**3. Рендеринг слайдов**
```
renderCurrentSlide() {
    const slideData = this.data.slides[this.currentSlideIndex];
    this.app.innerHTML = this.generateSlideHtml(slideData);
}
```

**4. Применение темы**
```
document.body.classList.add('theme-glass');
```

### Экспорт в PDF

**Алгоритм (Exporter.js):**

1. Создание скрытого `<iframe>` размером 1920×1080px
2. Копирование всех стилей из основного документа
3. Клонирование SVG definitions (градиенты)
4. Инжекция декоративных blob-элементов
5. Рендеринг каждого слайда внутри iframe
6. Захват растрового изображения через `html-to-image`
7. Вставка изображения в jsPDF
8. Сохранение PDF-файла

**Ключевые моменты:**
- Изоляция через iframe предотвращает загрязнение DOM
- Синхронизация стилей гарантирует точное воспроизведение темы
- Задержка 800ms перед захватом для завершения анимаций

### Экспорт в PPTX

**Гибридная стратегия (PptxExporter.js):**

**Фаза 1: Анализ слотов**
- Сканирование DOM-элементов (`.card`, `.section-card`, `.slide-title`)
- Вычисление геометрии каждого текстового блока в дюймах
- Применение буферизации (HEIGHT_BUFFER = 1.15) для компенсации расхождений в рендеринге

**Фаза 2: Скрытие текста**
```
makeContentTransparent(container) {
    container.querySelectorAll('h1, h2, h3, p, span').forEach(el => {
        el.style.color = 'transparent';
    });
}
```

**Фаза 3: Захват фона**
- Скриншот сцены размером 1920×1080px с прозрачным текстом
- Сохранение фона со всеми эффектами (градиенты, blur, тени)

**Фаза 4: Сборка слайда**
```
slide.background = { data: bgImage };
slide.addText(textObjects, {
    x: geometry.x,
    y: geometry.y,
    w: geometry.w,
    h: geometry.h,
    valign: 'top',
    fit: 'shrink'  // Автоматическое уменьшение шрифта
});
```

**Преимущества подхода:**
- Точное воспроизведение визуальных эффектов (фон-картинка)
- Редактируемый текст в PowerPoint (нативные текстовые блоки)
- Безопасность от overflow через буферизацию слотов

---

## Руководство для разработчика

### Добавление нового слайда

**1. Создайте шаблон:**

```
// src/templates/slides/QuoteSlide.js
export function QuoteSlide(data) {
    return `
        <div class="slide-layout">
            <blockquote>${data.quote}</blockquote>
            ite>${data.author}</cite>
        </div>
    `;
}
```

**2. Зарегистрируйте в Engine.js:**

```
import { QuoteSlide } from '../templates/slides/QuoteSlide.js';

generateSlideHtml(slideData) {
    switch (slideData.type) {
        case 'quote': return QuoteSlide(slideData);
        // ...
    }
}
```

**3. Добавьте данные:**

```
slides: [
    {
        type: 'quote',
        quote: 'Текст цитаты',
        author: 'Автор'
    }
]
```

### Добавление новой темы

**1. Создайте файл токенов:**

```
/* styles/tokens/theme-neon.css */
.theme-neon {
    --text-main: #00ff00;
    --accent-primary: #ff00ff;
    /* ... остальные переменные */
}
```

**2. Подключите в index.html:**

```
<link rel="stylesheet" href="./styles/tokens/theme-neon.css">
```

**3. Обновите ThemeManager.js:**

```
toggleTheme() {
    const themes = ['theme-glass', 'theme-material', 'theme-neon'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.applyTheme(nextTheme);
}
```

### Добавление иконки

**1. Определите SVG в icons.js:**

```
export const icons = {
    rocket: `
        <svg viewBox="0 0 100 100" class="icon-svg">
            <path d="M50 10 L70 50 L50 90 L30 50 Z" 
                  fill="url(#grad-icon)"/>
        </svg>
    `
};
```

**2. Используйте в данных:**

```
items: [
    { icon: 'rocket', title: 'Название', text: 'Описание' }
]
```

### Настройка PPTX-экспорта

**Буферизация слотов:**

```
// src/core/PptxExporter.js
this.HEIGHT_BUFFER = 1.15;  // +15% к высоте слота
this.FONT_SCALE = 0.85;     // Масштаб шрифта
```

**Добавление обработки нового компонента:**

```
analyzeSlots(container) {
    const newComponent = container.querySelector('.new-component');
    if (newComponent) {
        const geometry = this.getSlotGeometry(
            newComponent, 
            stageRect, 
            currentScale, 
            'middle'  // top | middle | bottom
        );
        shapes.push({
            textObjects: [this.createRichTextRun(newComponent.querySelector('h2'))],
            options: { ...geometry, valign: 'middle', fit: 'shrink' }
        });
    }
}
```

### Отладка

**1. Визуализация сцены экспорта:**

```
// В PptxExporter.js, закомментируйте удаление stage:
// if (stage && stage.parentNode) document.body.removeChild(stage);
```

**2. Проверка координат слотов:**

```
console.log('Slot geometry:', {
    x: geometry.x,
    y: geometry.y,
    w: geometry.w,
    h: geometry.h
});
```

**3. Crash Screen:**
- Автоматически активируется при JavaScript-ошибках
- Показывает стек-трейс в `#crash-screen`

---

## Зависимости

### Библиотеки

**html-to-image** (v1.11.11)
- **Назначение:** Конвертация DOM в растровые изображения (PNG)
- **Использование:** Экспорт PDF и фоновых изображений для PPTX
- **CDN:** `https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js`

**jsPDF** (v2.5.1)
- **Назначение:** Генерация PDF-документов на стороне клиента
- **Использование:** Сборка финального PDF из растровых слайдов
- **CDN:** `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

**PptxGenJS** (v3.12.0)
- **Назначение:** Создание редактируемых PPTX-файлов
- **Использование:** Гибридный экспорт (фон + векторный текст)
- **CDN:** `https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js`

### Шрифты (Google Fonts)

**Unbounded** (300, 400, 600, 700)
- Геометрический гротеск
- Использование: заголовки, акценты

**Raleway** (400, 500, 600)
- Гуманистический гротеск
- Использование: основной текст, описания

### Системные требования

**Браузеры:**
- Chrome 90+ (рекомендуется)
- Firefox 88+
- Safari 14+
- Edge 90+

**Минимальное разрешение:**
- Десктоп: 1280×720px
- Мобильный: 375×667px

**ES Modules:**
- Обязательна поддержка ES6 модулей (type="module")

---

## Лицензия

MIT License — свободное использование, модификация и распространение.

---

**Автор:** Nikita Tahirov  
**Версия:** 1.0.0  
**Дата:** 2023-10-27