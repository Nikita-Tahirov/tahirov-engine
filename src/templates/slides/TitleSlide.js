// src/templates/slides/TitleSlide.js

import { icons } from '../../data/icons.js';
import { typo } from '../../utils/Typography.js';

export function TitleSlide(data) {
    // Безопасное извлечение данных
    const presentationTitle = data.presentationTitle ? typo(data.presentationTitle) : '';
    const speakerName = data.speakerName ? typo(data.speakerName) : '';
    const speakerTitle = data.speakerTitle ? typo(data.speakerTitle) : '';
    const speakerDescription = data.speakerDescription ? typo(data.speakerDescription) : '';
    
    // Логотип (опционально)
    const logoHtml = (data.logo && icons.logo) ? `<div class="title-logo">${icons.logo}</div>` : '';

    // Блок с информацией о спикере
    const speakerHtml = `
        <div class="speaker-info">
            <h2 class="speaker-name">${speakerName}</h2>
            ${speakerTitle ? `<p class="speaker-title">${speakerTitle}</p>` : ''}
            ${speakerDescription ? `<p class="speaker-description">${speakerDescription}</p>` : ''}
        </div>
    `;

    return `
        <div class="slide-layout title-mode">
            <div class="title-background"></div>
            
            <div class="title-container">
                <div class="title-top">
                    ${logoHtml}
                </div>
                
                <div class="title-content">
                    <h1 class="presentation-title">${presentationTitle}</h1>
                    
                    <div class="title-divider"></div>
                    
                    ${speakerHtml}
                </div>
                
                <div class="title-accent"></div>
            </div>
        </div>
    `;
}
