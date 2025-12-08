/**
 * PresentationLoader
 * Модуль для динамической загрузки презентаций
 */
export class PresentationLoader {
    constructor() {
        this.cache = new Map();
        this.registry = null;
    }

    /**
     * Загружает реестр презентаций
     */
    async loadRegistry() {
        if (this.registry) {
            return this.registry;
        }

        try {
            const module = await import('../data/registry.js');
            this.registry = module.presentationRegistry;
            console.log('[PresentationLoader] Registry loaded:', this.registry.length, 'presentations');
            return this.registry;
        } catch (error) {
            console.error('[PresentationLoader] Failed to load registry:', error);
            throw new Error('Не удалось загрузить реестр презентаций');
        }
    }

    /**
     * Загружает презентацию по ID
     */
    async loadPresentation(id) {
        // Проверяем кэш
        if (this.cache.has(id)) {
            console.log('[PresentationLoader] Loaded from cache:', id);
            return this.cache.get(id);
        }

        // Загружаем реестр если еще не загружен
        if (!this.registry) {
            await this.loadRegistry();
        }

        // Находим метаданные презентации
        const metadata = this.registry.find(item => item.id === id);
        if (!metadata) {
            throw new Error(`Презентация "${id}" не найдена в реестре`);
        }

        try {
            // Динамически импортируем модуль презентации
            const basePath = '../data/';
            const fullPath = basePath + metadata.path;
            
            console.log('[PresentationLoader] Loading:', fullPath);
            const module = await import(fullPath);
            
            if (!module.presentationData) {
                throw new Error('Модуль презентации не экспортирует presentationData');
            }

            const data = module.presentationData;

            // Валидация
            if (!this.validatePresentation(data)) {
                throw new Error('Презентация имеет некорректную структуру');
            }

            // Сохраняем в кэш
            this.cache.set(id, data);
            
            console.log('[PresentationLoader] Successfully loaded:', id);
            return data;

        } catch (error) {
            console.error('[PresentationLoader] Failed to load presentation:', error);
            throw new Error(`Не удалось загрузить презентацию: ${error.message}`);
        }
    }

    /**
     * Валидация структуры презентации
     */
    validatePresentation(data) {
        if (!data || typeof data !== 'object') {
            console.error('[PresentationLoader] Data is not an object');
            return false;
        }

        if (!data.meta || !data.slides) {
            console.error('[PresentationLoader] Missing meta or slides');
            return false;
        }

        if (!Array.isArray(data.slides) || data.slides.length === 0) {
            console.error('[PresentationLoader] Slides must be a non-empty array');
            return false;
        }

        return true;
    }

    /**
     * Получает кэшированную презентацию
     */
    getCached(id) {
        return this.cache.get(id) || null;
    }

    /**
     * Очищает кэш
     */
    clearCache() {
        this.cache.clear();
        console.log('[PresentationLoader] Cache cleared');
    }
}
