export const presentationData = {
    meta: {
        title: "Эволюция источников знания",
        author: "Nikita Tahirov",
        date: "2023-10-27",
        layout: "presentation",
        defaultTheme: "theme-glass"
    },

    slides: [
        {
            id: "slide-section-1",
            type: "section",
            title: "Как работают нейросети и почему они так популярны?",
            logo: true
        },
        
        {
            id: "slide-main",
            type: "cards",
            title: "Эволюция источников знания",
            subtitle: "Сравнение методов обучения",
            logo: true,
            items: [
                {
                    icon: "dialog",
                    title: "Живой наставник",
                    text: "Единственный источник знаний. Информация передавалась из уст в уста, книги были редкими и дорогими."
                },
                {
                    icon: "book",
                    title: "Книги, фильмы",
                    text: "Знания стали доступнее. Можно учиться самостоятельно. Но информация статична – нет обратной связи."
                },
                {
                    icon: "brain",
                    title: "Нейронные сети",
                    text: "Интерактивные наставники на основе опыта человечества. Доступны каждому, отвечают на любой вопрос."
                }
            ],
            footer: {
                text: "С кем из великих деятелей вы бы хотели поговорить через нейросеть?",
                icon: "chat"
            }
        }
    ]
};
