import { icons } from '../../data/icons.js';
import { typo } from '../../utils/Typography.js';

export function CardsSlide(data) {
    // 1. Карточки (Safe Map)
    // Если items не передан, используем пустой массив, чтобы не вызвать crash
    const safeItems = Array.isArray(data.items) ? data.items : [];
    
    const cardsHtml = safeItems.map((item, index) => {
        // Безопасное получение иконки и текста
        const iconSvg = (item.icon && icons[item.icon]) ? icons[item.icon] : '';
        const title = item.title ? typo(item.title) : '';
        const text = item.text ? typo(item.text) : '';
        const delayStyle = `animation-delay: ${index * 0.15}s`;

        return `
            <div class="card" style="${delayStyle}">
                <div class="card-icon">
                    ${iconSvg}
                </div>
                <h3>${title}</h3>
                <p>${text}</p>
            </div>
        `;
    }).join('');

    // 2. Футер (Safe Check)
    // Проверяем наличие footer и текста внутри
    let footerHtml = '';
    if (data.footer && (data.footer.text || data.footer.icon)) {
        const footerIcon = (data.footer.icon && icons[data.footer.icon]) ? icons[data.footer.icon] : '';
        const footerText = data.footer.text ? `<span>Подумайте:</span> ${typo(data.footer.text)}` : '';
        
        footerHtml = `
            <div class="slide-footer">
                <div class="thought-bubble">
                    ${footerIcon}
                    <div class="thought-text">
                        ${footerText}
                    </div>
                </div>
            </div>
        `;
    }

    // 3. Логотип
    const logoHtml = (data.logo && icons.logo) ? `<div class="slide-logo">${icons.logo}</div>` : '';

    // 4. Заголовки (Safe Check)
    const titleHtml = data.title ? `<h1>${typo(data.title)}</h1>` : '';
    const subtitleHtml = data.subtitle ? `
        <div class="slide-subtitle">
            <div class="accent-line"></div>
            <h2>${typo(data.subtitle)}</h2>
        </div>` : '';

    return `
        <div class="slide-layout">
            <header class="slide-header">
                <div class="slide-title">
                    ${titleHtml}
                    ${subtitleHtml}
                </div>
                
                ${logoHtml}
            </header>

            <div class="cards-grid">
                ${cardsHtml}
            </div>

            ${footerHtml}
        </div>
    `;
}