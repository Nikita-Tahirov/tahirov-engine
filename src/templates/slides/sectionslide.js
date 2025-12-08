import { icons } from '../../data/icons.js';
import { typo } from '../../utils/Typography.js';

export function SectionSlide(data) {
    // Безопасный доступ к логотипу
    const logoHtml = data.logo && icons.logo ? `<div class="slide-logo">${icons.logo}</div>` : '';
    
    // Безопасный заголовок (если нет, будет пустая строка)
    const titleHtml = data.title ? typo(data.title) : '';

    return `
        <div class="slide-layout section-mode">
            <header class="slide-header">
                <div class="slide-title"></div>
                ${logoHtml}
            </header>

            <div class="section-content">
                <div class="card section-card">
                    <h1>${titleHtml}</h1>
                </div>
            </div>

            <div class="slide-footer"></div>
        </div>
    `;
}