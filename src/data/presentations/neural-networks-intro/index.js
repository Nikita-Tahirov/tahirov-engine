export const presentationData = {
    meta: {
        title: "Введение в нейронные сети",
        author: "Nikita Tahirov",
        date: "2023-11-15",
        layout: "presentation",
        defaultTheme: "theme-material"
    },

    slides: [
        {
            id: "slide-section-nn",
            type: "section",
            title: "Нейронные сети: от биологии к технологиям",
            logo: true
        },
        
        {
            id: "slide-nn-basics",
            type: "cards",
            title: "Основы нейронных сетей",
            subtitle: "Ключевые компоненты",
            logo: true,
            items: [
                {
                    icon: "brain",
                    title: "Нейроны",
                    text: "Базовые вычислительные единицы. Получают входные сигналы, обрабатывают их и передают дальше."
                },
                {
                    icon: "dialog",
                    title: "Связи",
                    text: "Веса соединений между нейронами. Определяют силу влияния одного нейрона на другой."
                },
                {
                    icon: "book",
                    title: "Обучение",
                    text: "Процесс настройки весов на основе данных. Сеть учится находить закономерности и делать предсказания."
                }
            ],
            footer: {
                text: "Какие задачи можно решать с помощью нейронных сетей?",
                icon: "chat"
            }
        }
    ]
};
