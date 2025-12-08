export class PresentationLayout {
    constructor(container) {
        this.container = container;
    }

    apply() {
        this.container.classList.add('layout-presentation');
        this.container.classList.remove('layout-document');
        
        // .layout-presentation { height: 100dvh; ... }
    }
}