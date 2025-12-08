export class Exporter {
    constructor() {
        this.isExporting = false;
    }

    async print(slidesArray, renderFunction) {
        if (this.isExporting) return;
        this.isExporting = true;
        console.log('[Exporter] Starting batch capture...');

        // 1. Создаем скрытый iframe
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '1920px', 
            height: '1080px',
            border: 'none',
            visibility: 'hidden', 
            zIndex: '-1000'
        });
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        const win = iframe.contentWindow;

        // 2. Копируем стили
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        styles.forEach(styleNode => {
            doc.head.appendChild(styleNode.cloneNode(true));
        });

        // 3. === ВАЖНО: КОПИРУЕМ SVG DEFINITIONS (Градиенты) ===
        const svgDefs = document.getElementById('global-svg-defs');
        if (svgDefs) {
            // Клонируем и вставляем в начало body айфрейма
            doc.body.insertBefore(svgDefs.cloneNode(true), doc.body.firstChild);
        }

        // 4. Настраиваем окружение
        doc.body.className = document.body.className;
        const computedStyle = window.getComputedStyle(document.body);
        
        Object.assign(doc.body.style, {
            backgroundColor: computedStyle.backgroundColor,
            backgroundImage: computedStyle.backgroundImage,
            backgroundSize: computedStyle.backgroundSize,
            backgroundPosition: computedStyle.backgroundPosition,
            backgroundRepeat: computedStyle.backgroundRepeat,
            margin: '0',
            padding: '0',
            overflow: 'hidden',
            width: '1920px',
            height: '1080px'
        });

        // 5. Эмуляция пятен (Blobs)
        const blob1 = document.createElement('div');
        const blob2 = document.createElement('div');
        
        const blobStyles = {
            position: 'absolute',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: getComputedStyle(document.body).getPropertyValue('--blob-opacity') || '0.12',
            zIndex: '-1'
        };

        Object.assign(blob1.style, blobStyles, {
            background: getComputedStyle(document.body).getPropertyValue('--blob-color-1') || '#8a00d4',
            top: '-20%',
            left: '-10%'
        });
        if (!blob1.style.background) blob1.style.background = '#8a00d4';

        Object.assign(blob2.style, blobStyles, {
            background: getComputedStyle(document.body).getPropertyValue('--blob-color-2') || '#0044ff',
            bottom: '-20%',
            right: '-10%'
        });

        doc.body.appendChild(blob1);
        doc.body.appendChild(blob2);

        // 6. Инициализация PDF
        const pdfWidth = 338.7;
        const pdfHeight = 190.5;
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });

        try {
            for (let i = 0; i < slidesArray.length; i++) {
                const slideData = slidesArray[i];

                const appWrapper = document.createElement('div');
                appWrapper.id = 'app';
                appWrapper.style.position = 'relative';
                appWrapper.style.zIndex = '1';
                appWrapper.style.height = '100%';
                appWrapper.innerHTML = renderFunction(slideData);

                const oldApp = doc.getElementById('app');
                if (oldApp) oldApp.remove();
                doc.body.appendChild(appWrapper);

                await new Promise(r => setTimeout(r, 800));

                const imgData = await window.htmlToImage.toPng(doc.body, {
                    quality: 1.0,
                    pixelRatio: 1,
                    width: 1920,
                    height: 1080,
                    style: {
                        backgroundColor: computedStyle.backgroundColor,
                        backgroundImage: computedStyle.backgroundImage
                    }
                });

                if (i > 0) pdf.addPage([pdfWidth, pdfHeight]);
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                console.log(`[Exporter] Slide ${i + 1}/${slidesArray.length} processed`);
            }

            const fileName = `presentation-full-${Date.now()}.pdf`;
            pdf.save(fileName);
            console.log('[Exporter] Full PDF saved:', fileName);

        } catch (error) {
            console.error('[Exporter] Error:', error);
            alert('Ошибка экспорта. См. консоль.');
        } finally {
            document.body.removeChild(iframe);
            this.isExporting = false;
        }
    }
}