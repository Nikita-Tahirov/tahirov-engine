import { icons } from '../data/icons.js';

/**
 * LibraryScreen
 * UI компонент для отображения библиотеки презентаций
 */
export class LibraryScreen {
    constructor(onSelect) {
        this.onSelect = onSelect; // Callback при выборе презентации
        this.container = null;
    }

    /**
     * Рендерит библиотеку в указанный контейнер
     */
    render(container, presentations) {
        this.container = container;
        
        if (!presentations || presentations.length === 0) {
            container.innerHTML = this.renderEmpty();
            return;
        }

        container.innerHTML = this.renderLayout(presentations);
        this.attachEvents(presentations);
    }

    /**
     * Генерирует HTML библиотеки
     */
    renderLayout(presentations) {
        const cardsHtml = presentations.map((item, index) => {
            return this.renderCard(item, index);
        }).join('');

        return `
            <div class="library-screen">
                <header class="library-header">
                    <div class="library-title">
                        <div class="library-logo">
                            ${icons.logo}
                        </div>
                        <h1>Tahirov Engine</h1>
                        <p class="library-subtitle">Выберите презентацию для запуска</p>
                    </div>
                </header>

                <div class="library-grid">
                    ${cardsHtml}
                </div>

                <footer class="library-footer">
                    <div class="library-hint">
                        <span>💡 Совет:</span> Используйте клавишу <kbd>M</kbd> для смены темы
                    </div>
                </footer>
            </div>
        `;
    }

    /**
     * Рендерит карточку презентации
     */
    renderCard(item, index) {
        const delay = `animation-delay: ${index * 0.1}s`;
        const tagsHtml = item.tags && item.tags.length > 0 
            ? `<div class="presentation-tags">
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
               </div>`
            : '';

        return `
            <div class="presentation-card" data-id="${item.id}" style="${delay}">
                <div class="presentation-icon">
                    ${icons.brain}
                </div>
                <div class="presentation-content">
                    <h3>${item.title}</h3>
                    <p class="presentation-description">${item.description}</p>
                    <div class="presentation-meta">
                        <span class="presentation-author">${item.author}</span>
                        <span class="presentation-date">${this.formatDate(item.date)}</span>
                    </div>
                    ${tagsHtml}
                </div>
                <div class="presentation-action">
                    <button class="btn-launch" data-id="${item.id}">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                        Запустить
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Рендерит пустое состояние
     */
    renderEmpty() {
        return `
            <div class="library-screen library-empty">
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h2>Презентации не найдены</h2>
                    <p>Добавьте презентации в реестр для их отображения</p>
                </div>
            </div>
        `;
    }

    /**
     * Привязывает обработчики событий
     */
    attachEvents(presentations) {
        presentations.forEach(item => {
            // Клик по карточке
            const card = this.container.querySelector(`.presentation-card[data-id="${item.id}"]`);
            if (card) {
                card.addEventListener('click', (e) => {
                    // Игнорируем клик по кнопке (она обрабатывается отдельно)
                    if (e.target.closest('.btn-launch')) return;
                    this.selectPresentation(item.id);
                });
            }

            // Клик по кнопке запуска
            const button = this.container.querySelector(`.btn-launch[data-id="${item.id}"]`);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectPresentation(item.id);
                });
            }
        });
    }

    /**
     * Обработка выбора презентации
     */
    selectPresentation(id) {
        console.log('[LibraryScreen] Selected:', id);
        if (this.onSelect) {
            this.onSelect(id);
        }
    }

    /**
     * Форматирование даты
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Удаляет библиотеку из DOM
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
