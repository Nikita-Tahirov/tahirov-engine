import { icons } from '../data/icons.js';

export class PptxExporter {
    constructor() {
        this.isExporting = false;
        // Константа масштаба: PPTX Widescreen (10 дюймов) / 1920px
        this.PX_TO_INCH = 10 / 1920; 
        
        // === НАСТРОЙКИ БУФЕРИЗАЦИИ ===
        this.HEIGHT_BUFFER = 1.15; // +15% к высоте слота для безопасности
        this.FONT_SCALE = 0.85;    // Чуть крупнее, чем 0.75, чтобы спровоцировать shrink
    }

    async export(data, renderFunction) {
        if (this.isExporting) return;
        this.isExporting = true;
        
        // UI
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        if (overlay) overlay.style.display = 'flex';

        const uiLeft = document.querySelector('.ui-controls-left');
        const uiRight = document.querySelector('.ui-controls-right');
        if (uiLeft) uiLeft.style.display = 'none';
        if (uiRight) uiRight.style.display = 'none';

        // Создаем СЦЕНУ
        const stage = this.createStage();
        document.body.appendChild(stage);

        try {
            console.log('[PptxExporter] Starting Export with Buffering...');
            if (typeof PptxGenJS === 'undefined') throw new Error('PptxGenJS library not loaded');

            const pres = new PptxGenJS();
            pres.layout = 'LAYOUT_16x9';

            for (let i = 0; i < data.slides.length; i++) {
                const slideData = data.slides[i];
                if (loadingText) loadingText.textContent = `Рендер слайда ${i + 1}/${data.slides.length}`;

                // 1. Рендерим слайд
                stage.innerHTML = renderFunction(slideData);
                await new Promise(r => setTimeout(r, 800));

                // 2. АНАЛИЗ СЛОТОВ
                const textShapes = this.analyzeSlots(stage);

                // 3. СКРЫВАЕМ ТЕКСТ
                this.makeContentTransparent(stage);
                
                // 4. СКРИНШОТ ФОНА
                const bgImage = await window.htmlToImage.toPng(stage, {
                    quality: 0.95,
                    pixelRatio: 2,
                    width: 1920,
                    height: 1080,
                    style: { transform: 'none', transformOrigin: 'top left' },
                    skipFonts: true
                });

                // 5. СБОРКА СЛАЙДА
                const slide = pres.addSlide();
                slide.background = { data: bgImage };

                // 6. ДОБАВЛЕНИЕ ТЕКСТА
                textShapes.forEach(shape => {
                    slide.addText(shape.textObjects, shape.options);
                });
            }

            if (loadingText) loadingText.textContent = 'Сохранение файла...';
            const fileName = `presentation-buffered-${Date.now()}.pptx`;
            await pres.writeFile({ fileName: fileName });
            console.log('[PptxExporter] Saved!');

        } catch (error) {
            console.error('PPTX Export failed:', error);
            alert(`Ошибка экспорта: ${error.message}`);
        } finally {
            if (stage && stage.parentNode) document.body.removeChild(stage);
            this.isExporting = false;
            if (overlay) overlay.style.display = 'none';
            if (uiLeft) uiLeft.style.display = 'flex';
            if (uiRight) uiRight.style.display = 'flex';
        }
    }

    createStage() {
        const stage = document.createElement('div');
        stage.id = 'pptx-stage';
        stage.className = document.body.className;
        
        const computedStyle = window.getComputedStyle(document.body);
        
        Object.assign(stage.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '1920px',
            height: '1080px',
            zIndex: '4000',
            backgroundColor: computedStyle.backgroundColor,
            backgroundImage: computedStyle.backgroundImage,
            backgroundSize: computedStyle.backgroundSize,
            backgroundRepeat: computedStyle.backgroundRepeat,
            backgroundPosition: computedStyle.backgroundPosition,
            overflow: 'hidden'
        });

        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        stage.style.transform = `scale(${scale})`;
        stage.style.transformOrigin = 'top left';

        this.injectBlobs(stage);
        return stage;
    }

    injectBlobs(container) {
        const style = getComputedStyle(document.body);
        const createBlob = (colorVar, top, left, bottom, right) => {
            const div = document.createElement('div');
            const bg = style.getPropertyValue(colorVar).trim();
            const opacity = style.getPropertyValue('--blob-opacity').trim();
            Object.assign(div.style, {
                position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%',
                filter: 'blur(100px)', zIndex: '-1',
                opacity: opacity, background: bg, top, left, bottom, right
            });
            return div;
        };
        container.insertBefore(createBlob('--blob-color-1', '-20%', '-10%', 'auto', 'auto'), container.firstChild);
        container.insertBefore(createBlob('--blob-color-2', 'auto', 'auto', '-20%', '-10%'), container.firstChild);
    }

    analyzeSlots(container) {
        const shapes = [];
        const match = container.style.transform.match(/scale\(([^)]+)\)/);
        const currentScale = match ? parseFloat(match[1]) : 1;
        const stageRect = container.getBoundingClientRect();

        // === 1. КАРТОЧКИ (.card) ===
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            // Геометрия с буфером
            // Для карточек выравнивание top, поэтому буфер просто увеличивает высоту вниз
            const geometry = this.getSlotGeometry(card, stageRect, currentScale, 'top');
            
            // Учет иконки (Safe Zone)
            const icon = card.querySelector('.card-icon');
            if (icon) {
                const iconRect = icon.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                const cardStyle = window.getComputedStyle(card);
                const paddingTop = parseFloat(cardStyle.paddingTop) || 0;

                const contentTopY = (cardRect.top + paddingTop - stageRect.top) / currentScale;
                const iconStyle = window.getComputedStyle(icon);
                const iconMarginBottom = parseFloat(iconStyle.marginBottom) || 20;
                const iconBottomY = (iconRect.bottom - stageRect.top) / currentScale + iconMarginBottom;

                if (iconBottomY > contentTopY) {
                    const shiftPx = iconBottomY - contentTopY;
                    const shiftInch = shiftPx * this.PX_TO_INCH;
                    geometry.y += shiftInch;
                    geometry.h -= shiftInch;
                }
            }

            const textObjects = [];
            const h3 = card.querySelector('h3');
            if (h3) textObjects.push(this.createRichTextRun(h3, { breakLine: true }));
            
            const p = card.querySelector('p');
            if (p) {
                if (h3) textObjects.push({ text: "\n", options: { fontSize: 6 } });
                textObjects.push(this.createRichTextRun(p));
            }

            if (textObjects.length > 0) {
                shapes.push({
                    textObjects: textObjects,
                    options: {
                        ...geometry,
                        valign: 'top',
                        align: 'left',
                        fit: 'shrink',
                        inset: 0,
                        wrap: true
                    }
                });
            }
        });

        // === 2. РАЗДЕЛ (.section-card) ===
        const sectionCard = container.querySelector('.section-card');
        if (sectionCard) {
            // Для центрированного контента буфер добавляется симметрично
            const geometry = this.getSlotGeometry(sectionCard, stageRect, currentScale, 'middle');
            const h1 = sectionCard.querySelector('h1');
            if (h1) {
                shapes.push({
                    textObjects: [this.createRichTextRun(h1)],
                    options: {
                        ...geometry,
                        valign: 'middle',
                        align: 'center',
                        fit: 'shrink',
                        inset: 0
                    }
                });
            }
        }

        // === 3. ЗАГОЛОВОК (.slide-title) ===
        const headerTitle = container.querySelector('.slide-title h1');
        if (headerTitle) {
            const parent = headerTitle.closest('.slide-title');
            const geometry = this.getSlotGeometry(parent, stageRect, currentScale, 'top');
            // Доп. запас для заголовка
            geometry.h += 0.5; 
            
            shapes.push({
                textObjects: [this.createRichTextRun(headerTitle)],
                options: { ...geometry, valign: 'top', align: 'left', fit: 'shrink', inset: 0 }
            });
        }

        // === 4. ПОДЗАГОЛОВОК (.slide-subtitle) ===
        const subtitle = container.querySelector('.slide-subtitle h2');
        if (subtitle) {
            const parent = subtitle.closest('.slide-subtitle');
            const geometry = this.getSlotGeometry(parent, stageRect, currentScale, 'middle');
            geometry.x += 0.2; geometry.w -= 0.2;
            shapes.push({
                textObjects: [this.createRichTextRun(subtitle)],
                options: { ...geometry, valign: 'middle', align: 'left', fit: 'shrink', inset: 0 }
            });
        }

        // === 5. ФУТЕР (.thought-text) ===
        const footerText = container.querySelector('.thought-text');
        if (footerText) {
            const bubble = footerText.closest('.thought-bubble');
            const geometry = this.getSlotGeometry(bubble, stageRect, currentScale, 'middle');
            geometry.x += 0.6; geometry.w -= 0.6;

            const textItems = [];
            const span = footerText.querySelector('span');
            let mainText = footerText.innerText;
            if (span) {
                textItems.push(this.createRichTextRun(span, { suffix: ' ' }));
                mainText = mainText.replace(span.innerText, '').trim();
            }
            textItems.push(this.createRichTextRun({ 
                innerText: mainText, 
                computedStyle: window.getComputedStyle(footerText) 
            }));

            shapes.push({
                textObjects: textItems,
                options: { ...geometry, valign: 'middle', align: 'left', fit: 'shrink', inset: 0 }
            });
        }

        return shapes;
    }

    /**
     * Вычисляет геометрию с применением БУФЕРА
     * @param verticalAlign 'top' | 'middle' | 'bottom' - влияет на то, куда расширять буфер
     */
    getSlotGeometry(element, stageRect, scale, verticalAlign = 'top') {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        const padTop = parseFloat(style.paddingTop) || 0;
        const padRight = parseFloat(style.paddingRight) || 0;
        const padBottom = parseFloat(style.paddingBottom) || 0;
        const padLeft = parseFloat(style.paddingLeft) || 0;

        const relX = (rect.left - stageRect.left) / scale;
        const relY = (rect.top - stageRect.top) / scale;
        const relW = rect.width / scale;
        const relH = rect.height / scale;

        // Базовые координаты (в дюймах)
        let x = (relX + padLeft) * this.PX_TO_INCH;
        let y = (relY + padTop) * this.PX_TO_INCH;
        let w = (relW - padLeft - padRight) * this.PX_TO_INCH;
        let h = (relH - padTop - padBottom) * this.PX_TO_INCH;

        // === ПРИМЕНЕНИЕ БУФЕРА ===
        // Увеличиваем высоту
        const bufferedH = h * this.HEIGHT_BUFFER;
        const diff = bufferedH - h;

        // Смещаем Y в зависимости от выравнивания, чтобы центр остался на месте
        if (verticalAlign === 'middle') {
            y -= diff / 2;
        } else if (verticalAlign === 'bottom') {
            y -= diff;
        }
        // Если 'top', то y не меняем, блок просто растет вниз

        return { x, y, w, h: bufferedH };
    }

    createRichTextRun(element, extra = {}) {
        const style = element.computedStyle || window.getComputedStyle(element);
        const text = extra.overrideText || element.innerText || '';
        const fontFace = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        
        let color = style.color;
        if (style.webkitTextFillColor === 'transparent') {
             color = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim();
        }

        // Используем увеличенный скейл для шрифта
        const fontSize = parseFloat(style.fontSize) * this.FONT_SCALE;

        return {
            text: text + (extra.suffix || ''),
            options: {
                fontFace: fontFace,
                fontSize: extra.fontSizeScale ? fontSize * extra.fontSizeScale : fontSize,
                color: this.rgbToHex(color),
                bold: parseInt(style.fontWeight) >= 600 || style.fontWeight === 'bold',
                italic: style.fontStyle === 'italic',
                breakLine: extra.breakLine,
                paraSpaceBefore: extra.spacingBefore
            }
        };
    }

    makeContentTransparent(container) {
        const selectors = 'h1, h2, h3, p, span, .thought-text';
        container.querySelectorAll(selectors).forEach(el => {
            el.style.color = 'transparent';
            el.style.webkitTextFillColor = 'transparent';
            el.style.textShadow = 'none';
        });
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '000000';
        if (rgb.startsWith('#')) return rgb.substring(1);
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) return '000000';
        return ((1 << 24) + (parseInt(match[0]) << 16) + (parseInt(match[1]) << 8) + parseInt(match[2])).toString(16).slice(1).toUpperCase();
    }
}