export class ThemeManager {
    constructor(defaultTheme = 'theme-glass') {
        this.currentTheme = defaultTheme;
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        const classesToRemove = [];
        document.body.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                classesToRemove.push(className);
            }
        });

        classesToRemove.forEach(cls => document.body.classList.remove(cls));

        document.body.classList.add(themeName);
        this.currentTheme = themeName;
        
        console.log(`[Tahirov Engine] Theme applied: ${themeName}`);
    }

    toggleTheme() {
        // Переключаем между новыми темами
        if (this.currentTheme === 'theme-glass') {
            this.applyTheme('theme-material');
        } else {
            this.applyTheme('theme-glass');
        }
    }
}