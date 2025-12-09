console.log('[Engine.js] Loading modules...');

import { ThemeManager } from './ThemeManager.js';
import { Exporter } from './Exporter.js';
import { PptxExporter } from './PptxExporter.js'; 
import { PresentationLoader } from './PresentationLoader.js';
import { LibraryScreen } from '../ui/LibraryScreen.js';
import { CardsSlide } from '../templates/slides/CardsSlide.js';
import { SectionSlide } from '../templates/slides/SectionSlide.js';
import { TitleSlide } from '../templates/slides/TitleSlide.js';

class Engine {
    constructor() {
        this.app = document.getElementById('app');
        this.mode = 'library'; // 'library' | 'presentation'
        this.data = null;
        this.currentSlideIndex = 0;
        
        // Инициализация модулей
        this.themeManager = new ThemeManager('theme-glass');
        this.exporter = new Exporter();
        this.pptxExporter = new PptxExporter();
        this.loader = new PresentationLoader();
        this.libraryScreen = new LibraryScreen((id) => this.loadPresentation(id));
        
        this.init();
    }

    async init() {
        console.log('[Tahirov Engine] Initialized in Library Mode');
        
        // Скрываем навигационные кнопки в режиме библиотеки
        this.updateUIControls();
        
        try {
            // Загружаем реестр презентаций
            const registry = await this.loader.loadRegistry();
            
            // Отображаем библиотеку
            this.libraryScreen.render(this.app, registry);
            
        } catch (error) {
            console.error('[Engine] Failed to initialize library:', error);
            this.app.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--text-main);">
                    <h2>⚠️ Ошибка загрузки</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        // Привязываем глобальные события
        this.attachGlobalEvents();
    }

    /**
     * Загружает и запускает презентацию
     */
    async loadPresentation(id) {
        console.log('[Engine] Loading presentation:', id);
        
        // Показываем индикатор загрузки
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        if (overlay) {
            overlay.style.display = 'flex';
            if (loadingText) loadingText.textContent = 'Загрузка презентации...';
        }

        try {
            // Загружаем данные презентации
            this.data = await this.loader.loadPresentation(id);
            
            // Применяем тему по умолчанию для презентации
            if (this.data.meta.defaultTheme) {
                this.themeManager.applyTheme(this.data.meta.defaultTheme);
            }

            // Переключаемся в режим презентации
            this.mode = 'presentation';
            this.currentSlideIndex = 0;
            
            // Обновляем UI
            this.updateUIControls();
            
            // Рендерим первый слайд
            this.renderCurrentSlide();
            
            console.log('[Engine] Presentation loaded successfully');

        } catch (error) {
            console.error('[Engine] Failed to load presentation:', error);
            alert(`Не удалось загрузить презентацию: ${error.message}`);
        } finally {
            if (overlay) overlay.style.display = 'none';
        }
    }

    /**
     * Возвращает к библиотеке презентаций
     */
    async returnToLibrary() {
        console.log('[Engine] Returning to library');
        
        // Переключаемся в режим библиотеки
        this.mode = 'library';
        this.data = null;
        this.currentSlideIndex = 0;
        
        // Обновляем UI
        this.updateUIControls();
        
        try {
            // Загружаем реестр
            const registry = await this.loader.loadRegistry();
            
            // Отображаем библиотеку
            this.libraryScreen.render(this.app, registry);
            
        } catch (error) {
            console.error('[Engine] Failed to return to library:', error);
        }
    }

    /**
     * Обновляет видимость UI-контролов в зависимости от режима
     */
    updateUIControls() {
        const leftControls = document.querySelector('.ui-controls-left');
        const rightControls = document.querySelector('.ui-controls-right');
        const backButton = document.getElementById('back-to-library-btn');

        if (this.mode === 'library') {
            // В режиме библиотеки скрываем навигацию и экспорт
            if (rightControls) rightControls.style.display = 'none';
            if (leftControls) {
                const exportBtn = document.getElementById('export-btn');
                const pptxBtn = document.getElementById('pptx-btn');
                if (exportBtn) exportBtn.style.display = 'none';
                if (pptxBtn) pptxBtn.style.display = 'none';
            }
            if (backButton) backButton.style.display = 'none';

        } else if (this.mode === 'presentation') {
            // В режиме презентации показываем все контролы
            if (rightControls) rightControls.style.display = 'flex';
            if (leftControls) {
                const exportBtn = document.getElementById('export-btn');
                const pptxBtn = document.getElementById('pptx-btn');
                if (exportBtn) exportBtn.style.display = 'flex';
                if (pptxBtn) pptxBtn.style.display = 'flex';
            }
            if (backButton) backButton.style.display = 'flex';
        }
    }

    attachGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Горячие клавиши для режима библиотеки
            if (this.mode === 'library') {
                if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    this.themeManager.toggleTheme();
                }
                return; // Остальные клавиши не работают в режиме библиотеки
            }

            // Горячие клавиши для режима презентации
            if (this.mode === 'presentation') {
                if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    this.themeManager.toggleTheme();
                }
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.returnToLibrary();
                }
                if (e.code === 'ArrowLeft') this.changeSlide(-1);
                if (e.code === 'ArrowRight' || e.code === 'Space') this.changeSlide(1);
            }
        });

        const bindClick = (id, handler) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', () => { handler(); btn.blur(); });
        };

        bindClick('theme-toggle-btn', () => this.themeManager.toggleTheme());
        bindClick('export-btn', () => {
            if (this.mode === 'presentation' && this.data) {
                this.exporter.print(this.data.slides, this.generateSlideHtml.bind(this));
            }
        });
        bindClick('pptx-btn', () => {
            if (this.mode === 'presentation' && this.data) {
                this.pptxExporter.export(this.data, this.generateSlideHtml.bind(this));
            }
        });
        bindClick('prev-slide-btn', () => this.changeSlide(-1));
        bindClick('next-slide-btn', () => this.changeSlide(1));
        bindClick('back-to-library-btn', () => this.returnToLibrary());
    }

    changeSlide(direction) {
        if (this.mode !== 'presentation' || !this.data) return;

        const newIndex = this.currentSlideIndex + direction;
        if (newIndex >= 0 && newIndex < this.data.slides.length) {
            this.currentSlideIndex = newIndex;
            this.renderCurrentSlide();
        }
    }

    generateSlideHtml(slideData) {
        switch (slideData.type) {
                            case 'title': return TitleSlide(slideData);
            case 'cards': return CardsSlide(slideData);
            case 'section': return SectionSlide(slideData);
            case 'cover': return `<h1>${slideData.title}</h1>`;
            default: return `<h1>Unknown Slide Type</h1>`;
        }
    }

    renderCurrentSlide() {
        if (this.mode !== 'presentation' || !this.data) return;

        const slideData = this.data.slides[this.currentSlideIndex];
        if (!slideData) return;
        this.app.innerHTML = this.generateSlideHtml(slideData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new Engine(), 50);
});
