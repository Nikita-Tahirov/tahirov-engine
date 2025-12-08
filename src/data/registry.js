/**
 * Центральный реестр презентаций
 * Единственный источник истины о доступных презентациях
 */
export const presentationRegistry = [
    {
        id: 'evolution-of-knowledge',
        title: 'Эволюция источников знания',
        description: 'Сравнение методов обучения: от живого наставника до нейросетей',
        author: 'Nikita Tahirov',
        date: '2023-10-27',
        path: './presentations/evolution-of-knowledge/index.js',
        defaultTheme: 'theme-glass',
        tags: ['образование', 'AI', 'история']
    },
    {
        id: 'neural-networks-intro',
        title: 'Введение в нейронные сети',
        description: 'Основы работы искусственных нейронных сетей и их ключевые компоненты',
        author: 'Nikita Tahirov',
        date: '2023-11-15',
        path: './presentations/neural-networks-intro/index.js',
        defaultTheme: 'theme-material',
        tags: ['AI', 'технологии', 'обучение']
    }
];
