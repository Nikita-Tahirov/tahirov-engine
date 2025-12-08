export class DocumentLayout {
    constructor(container) {
        this.container = container;
    }

    apply() {
        // Добавляем класс для специфичных стилей документа
        this.container.classList.add('layout-document');
        this.container.classList.remove('layout-presentation');
        
        // В CSS можно добавить:
        // .layout-document { max-width: 210mm; min-height: 297mm; ... }
    }
}