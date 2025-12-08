export const certificateData = {
    meta: {
        title: "Сертификат о прохождении",
        layout: "document", // Режим документа (A4)
        defaultTheme: "theme-material" // Светлая тема лучше для документов
    },
    slides: [
        {
            id: "cert-1",
            type: "certificate", // Нам понадобится шаблон CertificateSlide.js в будущем
            title: "Сертификат",
            recipient: "Никита Тахиров",
            course: "Архитектура антихрупких веб-систем",
            date: "27 октября 2023",
            logo: true
        }
    ]
};