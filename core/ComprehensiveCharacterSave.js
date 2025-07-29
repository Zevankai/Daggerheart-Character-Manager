/**
 * Comprehensive Character Save System
 * Captures EVERYTHING on the page for each character:
 * - All form inputs and contenteditable elements
 * - All moveable section positions and transforms
 * - All images and background settings
 * - All color customizations and theme settings
 * - All circle states (HP, Stress, Hope, Armor)
 * - All equipment, journal, details, experiences
 * - All localStorage data
 * - All tab states and UI preferences
 * - All damage thresholds and ability scores
 * - Section visibility and order
 */

class ComprehensiveCharacterSave {
    constructor() {
        this.currentCharacterId = null;
        this.isCapturing = false;
        console.log('🔧 ComprehensiveCharacterSave initialized');
    }

    /**
     * Set the current character ID
     */
    setCurrentCharacter(characterId) {
        this.currentCharacterId = characterId;
        localStorage.setItem('zevi-current-character-id', characterId);
        console.log(`📋 Current character set to: ${characterId}`);
    }

    /**
     * Get the current character ID
     */
    getCurrentCharacter() {
        return this.currentCharacterId || localStorage.getItem('zevi-current-character-id');
    }

    /**
     * CAPTURE EVERYTHING - Complete page state capture
     */
    captureCompleteCharacterState() {
        if (this.isCapturing) return; // Prevent recursive calls
        this.isCapturing = true;

        console.log('🔍 Starting comprehensive character state capture...');

        const characterData = {
            // Metadata
            captureTimestamp: new Date().toISOString(),
            version: '2.0.0',
            
            // === BASIC CHARACTER INFO ===
            basicInfo: this.captureBasicInfo(),
            
            // === VISUAL APPEARANCE ===
            appearance: this.captureAppearance(),
            
            // === LAYOUT & POSITIONS ===
            layout: this.captureLayout(),
            
            // === ABILITY SCORES & STATS ===
            stats: this.captureStats(),
            
            // === CIRCLE TRACKERS ===
            trackers: this.captureTrackers(),
            
            // === EQUIPMENT SYSTEM ===
            equipment: this.captureEquipment(),
            
            // === CHARACTER SHEET TABS ===
            characterSheet: this.captureCharacterSheet(),
            
            // === UI PREFERENCES ===
            uiPreferences: this.captureUIPreferences(),
            
            // === CUSTOM SETTINGS ===
            customizations: this.captureCustomizations(),
            
            // === ALL LOCALSTORAGE DATA ===
            localStorage: this.captureLocalStorage()
        };

        this.isCapturing = false;
        console.log('✅ Character state capture complete:', characterData);
        return characterData;
    }

    /**
     * Capture basic character information
     */
    captureBasicInfo() {
        const nameInput = document.querySelector('.name-box input[type="text"]');
        const subtitleDiv = document.querySelector('.name-box .subtitle');
        const levelDisplay = document.querySelector('#charLevel');
        const domain1 = document.querySelector('.domain-badge:first-of-type');
        const domain2 = document.querySelector('.domain-badge:last-of-type');
        const charImage = document.querySelector('#charImage');

        return {
            name: nameInput?.value || 'Character Name',
            subtitle: subtitleDiv?.textContent || 'Community Ancestry Class (Subclass)',
            level: levelDisplay?.textContent || '5',
            domain1: domain1?.textContent || 'Domain 1',
            domain2: domain2?.textContent || 'Domain 2',
            imageUrl: charImage?.src || '',
            imageAlt: charImage?.alt || 'Character Portrait'
        };
    }

    /**
     * Capture all visual appearance settings
     */
    captureAppearance() {
        const body = document.body;
        const glass = document.querySelector('.glass');
        const themeToggle = document.querySelector('#toggleTheme');

        return {
            // Background
            backgroundImage: body.style.backgroundImage || getComputedStyle(body).backgroundImage,
            backgroundSize: body.style.backgroundSize || getComputedStyle(body).backgroundSize,
            backgroundPosition: body.style.backgroundPosition || getComputedStyle(body).backgroundPosition,
            
            // Theme
            isDarkMode: themeToggle?.textContent === '☀️',
            
            // Glass effect
            glassOpacity: glass?.style.backgroundColor || getComputedStyle(glass)?.backgroundColor,
            
            // Colors (from CSS variables)
            accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-color'),
            textColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
            glassBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--glass-background-color'),
            charImageBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--char-image-border-color'),
            
            // All color targets
            colorTargets: this.captureColorTargets()
        };
    }

    /**
     * Capture color target elements
     */
    captureColorTargets() {
        const colorTargets = {};
        document.querySelectorAll('[data-color-target]').forEach(element => {
            const target = element.getAttribute('data-color-target');
            colorTargets[target] = {
                backgroundColor: element.style.backgroundColor || getComputedStyle(element).backgroundColor,
                borderColor: element.style.borderColor || getComputedStyle(element).borderColor,
                color: element.style.color || getComputedStyle(element).color
            };
        });
        return colorTargets;
    }

    /**
     * Capture layout and draggable positions
     */
    captureLayout() {
        const draggableSections = document.querySelector('#draggable-sections');
        const sections = {};
        
        // Capture each draggable section
        document.querySelectorAll('.section[data-id]').forEach(section => {
            const id = section.getAttribute('data-id');
            const rect = section.getBoundingClientRect();
            
            sections[id] = {
                dataId: id,
                position: {
                    top: section.style.top || '0px',
                    left: section.style.left || '0px',
                    transform: section.style.transform || '',
                    width: section.style.width || getComputedStyle(section).width,
                    height: section.style.height || getComputedStyle(section).height
                },
                boundingRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                },
                visibility: section.style.display !== 'none',
                order: Array.from(section.parentNode.children).indexOf(section)
            };
        });

        return {
            sections,
            containerStyle: {
                flexDirection: draggableSections?.style.flexDirection || '',
                justifyContent: draggableSections?.style.justifyContent || '',
                alignItems: draggableSections?.style.alignItems || ''
            }
        };
    }

    /**
     * Capture all stats and ability scores
     */
    captureStats() {
        const attributes = {};
        document.querySelectorAll('.attribute-value[data-attribute]').forEach(input => {
            const attr = input.getAttribute('data-attribute');
            attributes[attr] = parseInt(input.value) || 0;
        });

        const evasionInput = document.querySelector('#evasionValue');
        const damageInputs = {
            minor: document.querySelector('#minor-damage-value'),
            major: document.querySelector('#major-damage-value'),
            severe: document.querySelector('#severe-damage-value')
        };

        return {
            attributes,
            evasion: parseInt(evasionInput?.value) || 10,
            damageThresholds: {
                minor: parseInt(damageInputs.minor?.value) || 0,
                major: parseInt(damageInputs.major?.value) || 0,
                severe: parseInt(damageInputs.severe?.value) || 0
            }
        };
    }

    /**
     * Capture all circle trackers (HP, Stress, Hope, Armor)
     */
    captureTrackers() {
        return {
            hp: this.captureCircleTracker('hp'),
            stress: this.captureCircleTracker('stress'),
            armor: this.captureCircleTracker('armor'),
            hope: this.captureHopeTracker()
        };
    }

    /**
     * Capture individual circle tracker
     */
    captureCircleTracker(type) {
        const tracker = document.querySelector(`#${type}-tracker`);
        const circles = [];
        
        if (tracker) {
            tracker.querySelectorAll('.circle').forEach((circle, index) => {
                circles.push({
                    index,
                    active: circle.classList.contains('active'),
                    filled: circle.classList.contains('filled'),
                    classes: Array.from(circle.classList),
                    style: circle.getAttribute('style') || ''
                });
            });
        }

        return {
            circles,
            current: parseInt(localStorage.getItem(`zevi-${type}-current`)) || 0,
            max: circles.length,
            localStorageData: JSON.parse(localStorage.getItem(`zevi-${type}-circles`)) || []
        };
    }

    /**
     * Capture hope tracker specifically
     */
    captureHopeTracker() {
        const hopeTracker = document.querySelector('#hope-tracker');
        const circles = [];
        
        if (hopeTracker) {
            hopeTracker.querySelectorAll('.circle').forEach((circle, index) => {
                circles.push({
                    index,
                    active: circle.classList.contains('active'),
                    filled: circle.classList.contains('filled'),
                    classes: Array.from(circle.classList),
                    style: circle.getAttribute('style') || ''
                });
            });
        }

        const hopeData = JSON.parse(localStorage.getItem('zevi-hope')) || { current: 0, max: 6 };
        
        return {
            circles,
            current: hopeData.current,
            max: hopeData.max,
            localStorageData: hopeData
        };
    }

    /**
     * Capture all equipment data
     */
    captureEquipment() {
        const equipmentData = JSON.parse(localStorage.getItem('zevi-equipment')) || {};
        
        return {
            localStorage: equipmentData,
            backpackSelection: document.querySelector('#backpack-select')?.value || 'standard',
            backpackToggle: document.querySelector('#backpackToggle')?.checked || false,
            // Capture any visible equipment UI elements
            visibleEquipment: this.captureVisibleEquipment()
        };
    }

    /**
     * Capture visible equipment UI elements
     */
    captureVisibleEquipment() {
        const equipment = {};
        
        // Capture any equipment forms or displays that might be visible
        document.querySelectorAll('[id*="equipment"], [class*="equipment"]').forEach(element => {
            if (element.id || element.className) {
                const key = element.id || element.className;
                equipment[key] = {
                    tagName: element.tagName,
                    value: element.value || element.textContent || '',
                    checked: element.checked,
                    selected: element.selected,
                    style: element.getAttribute('style') || '',
                    display: getComputedStyle(element).display
                };
            }
        });
        
        return equipment;
    }

    /**
     * Capture all character sheet tab data
     */
    captureCharacterSheet() {
        return {
            // Active tab
            activeTab: document.querySelector('.tabs button.active')?.getAttribute('data-target') || 'downtime-tab-content',
            
            // Tab content data
            journal: {
                entries: JSON.parse(localStorage.getItem('zevi-journal-entries')) || [],
                activeCategory: document.querySelector('.journal-category-buttons .button.active')?.getAttribute('data-journal-category') || 'all'
            },
            
            details: JSON.parse(localStorage.getItem('zevi-character-details')) || { personal: {}, physical: {} },
            
            experiences: JSON.parse(localStorage.getItem('zevi-experiences')) || [],
            
            downtime: {
                projects: JSON.parse(localStorage.getItem('zevi-projects')) || [],
                activeView: this.getActiveDowntimeView()
            },
            
            domainVault: {
                cards: JSON.parse(localStorage.getItem('zevi-domain-cards')) || [],
                selectedDomains: JSON.parse(localStorage.getItem('zevi-selected-domains')) || [],
                abilities: JSON.parse(localStorage.getItem('zevi-domain-abilities')) || {}
            },
            
            effectsFeatures: {
                activeEffects: JSON.parse(localStorage.getItem('zevi-active-effects')) || [],
                features: JSON.parse(localStorage.getItem('zevi-features')) || [],
                conditions: JSON.parse(localStorage.getItem('zevi-conditions')) || []
            }
        };
    }

    /**
     * Get active downtime view
     */
    getActiveDowntimeView() {
        const views = ['rest-type-selector', 'rest-options-container', 'long-rest-projects-container', 'rest-summary-area'];
        for (const view of views) {
            const element = document.querySelector(`#${view}`);
            if (element && getComputedStyle(element).display !== 'none') {
                return view;
            }
        }
        return 'rest-type-selector';
    }

    /**
     * Capture UI preferences and settings
     */
    captureUIPreferences() {
        return {
            // Settings tab values
            accentColor: document.querySelector('#accentColorPicker')?.value || '#ffd700',
            glassColor: document.querySelector('#glassColorPicker')?.value || '#ffffff',
            glassOpacity: document.querySelector('#glassOpacitySlider')?.value || '10',
            characterCode: document.querySelector('#characterCodeDisplay')?.value || '',
            
            // Filter states
            platformFilter: document.querySelector('#platformFilter')?.value || 'all',
            characterSearch: document.querySelector('#characterSearch')?.value || '',
            
            // Modal states
            modalsOpen: this.getOpenModals(),
            
            // Scroll positions
            scrollPositions: this.getScrollPositions()
        };
    }

    /**
     * Get currently open modals
     */
    getOpenModals() {
        const openModals = [];
        document.querySelectorAll('.modal').forEach(modal => {
            if (getComputedStyle(modal).display !== 'none') {
                openModals.push(modal.id);
            }
        });
        return openModals;
    }

    /**
     * Get scroll positions
     */
    getScrollPositions() {
        return {
            window: { x: window.scrollX, y: window.scrollY },
            body: { x: document.body.scrollLeft, y: document.body.scrollTop }
        };
    }

    /**
     * Capture customizations and theme data
     */
    captureCustomizations() {
        return {
            cssVariables: this.captureCSSVariables(),
            inlineStyles: this.captureInlineStyles(),
            customClasses: this.captureCustomClasses()
        };
    }

    /**
     * Capture CSS variables
     */
    captureCSSVariables() {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const variables = {};
        
        // Capture all CSS variables
        for (let i = 0; i < computedStyle.length; i++) {
            const property = computedStyle[i];
            if (property.startsWith('--')) {
                variables[property] = computedStyle.getPropertyValue(property);
            }
        }
        
        return variables;
    }

    /**
     * Capture inline styles
     */
    captureInlineStyles() {
        const inlineStyles = {};
        document.querySelectorAll('[style]').forEach((element, index) => {
            const identifier = element.id || element.className || `element-${index}`;
            inlineStyles[identifier] = element.getAttribute('style');
        });
        return inlineStyles;
    }

    /**
     * Capture custom classes
     */
    captureCustomClasses() {
        const customClasses = {};
        document.querySelectorAll('[class]').forEach((element, index) => {
            const identifier = element.id || `element-${index}`;
            customClasses[identifier] = Array.from(element.classList);
        });
        return customClasses;
    }

    /**
     * Capture ALL localStorage data
     */
    captureLocalStorage() {
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('zevi-')) {
                try {
                    const value = localStorage.getItem(key);
                    // Try to parse as JSON, fall back to string
                    try {
                        localStorageData[key] = JSON.parse(value);
                    } catch {
                        localStorageData[key] = value;
                    }
                } catch (error) {
                    console.warn(`Failed to capture localStorage key: ${key}`, error);
                }
            }
        }
        return localStorageData;
    }

    /**
     * RESTORE EVERYTHING - Complete page state restoration
     */
    async restoreCompleteCharacterState(characterData) {
        if (!characterData) {
            console.warn('⚠️ No character data to restore');
            return;
        }

        console.log('🔄 Starting comprehensive character state restoration...', characterData);

        try {
            // Restore in specific order to avoid conflicts
            await this.restoreBasicInfo(characterData.basicInfo);
            await this.restoreAppearance(characterData.appearance);
            await this.restoreStats(characterData.stats);
            await this.restoreLocalStorage(characterData.localStorage);
            await this.restoreTrackers(characterData.trackers);
            await this.restoreEquipment(characterData.equipment);
            await this.restoreCharacterSheet(characterData.characterSheet);
            await this.restoreLayout(characterData.layout);
            await this.restoreUIPreferences(characterData.uiPreferences);
            await this.restoreCustomizations(characterData.customizations);

            // Refresh all systems
            this.refreshAllSystems();

            console.log('✅ Character state restoration complete');
        } catch (error) {
            console.error('❌ Error during character state restoration:', error);
        }
    }

    /**
     * Restore basic character info
     */
    async restoreBasicInfo(basicInfo) {
        if (!basicInfo) return;

        const nameInput = document.querySelector('.name-box input[type="text"]');
        const subtitleDiv = document.querySelector('.name-box .subtitle');
        const levelDisplay = document.querySelector('#charLevel');
        const domain1 = document.querySelector('.domain-badge:first-of-type');
        const domain2 = document.querySelector('.domain-badge:last-of-type');
        const charImage = document.querySelector('#charImage');
        const charPlaceholder = document.querySelector('#charPlaceholder');

        if (nameInput) nameInput.value = basicInfo.name || 'Character Name';
        if (subtitleDiv) subtitleDiv.textContent = basicInfo.subtitle || 'Community Ancestry Class (Subclass)';
        if (levelDisplay) levelDisplay.textContent = basicInfo.level || '5';
        if (domain1) domain1.textContent = basicInfo.domain1 || 'Domain 1';
        if (domain2) domain2.textContent = basicInfo.domain2 || 'Domain 2';
        
        if (charImage && basicInfo.imageUrl) {
            charImage.src = basicInfo.imageUrl;
            charImage.alt = basicInfo.imageAlt || 'Character Portrait';
            if (charPlaceholder) charPlaceholder.style.display = 'none';
        } else if (charPlaceholder) {
            charPlaceholder.style.display = 'block';
        }
    }

    /**
     * Restore appearance settings
     */
    async restoreAppearance(appearance) {
        if (!appearance) return;

        const body = document.body;
        const glass = document.querySelector('.glass');
        const root = document.documentElement;

        // Restore background
        if (appearance.backgroundImage) {
            body.style.backgroundImage = appearance.backgroundImage;
        }
        if (appearance.backgroundSize) {
            body.style.backgroundSize = appearance.backgroundSize;
        }
        if (appearance.backgroundPosition) {
            body.style.backgroundPosition = appearance.backgroundPosition;
        }

        // Restore CSS variables
        if (appearance.accentColor) {
            root.style.setProperty('--accent-color', appearance.accentColor);
        }
        if (appearance.textColor) {
            root.style.setProperty('--text-color', appearance.textColor);
        }
        if (appearance.glassBackgroundColor) {
            root.style.setProperty('--glass-background-color', appearance.glassBackgroundColor);
        }
        if (appearance.charImageBorderColor) {
            root.style.setProperty('--char-image-border-color', appearance.charImageBorderColor);
        }

        // Restore color targets
        if (appearance.colorTargets) {
            Object.entries(appearance.colorTargets).forEach(([target, styles]) => {
                const element = document.querySelector(`[data-color-target="${target}"]`);
                if (element) {
                    if (styles.backgroundColor) element.style.backgroundColor = styles.backgroundColor;
                    if (styles.borderColor) element.style.borderColor = styles.borderColor;
                    if (styles.color) element.style.color = styles.color;
                }
            });
        }
    }

    /**
     * Restore stats and ability scores
     */
    async restoreStats(stats) {
        if (!stats) return;

        // Restore attributes
        if (stats.attributes) {
            Object.entries(stats.attributes).forEach(([attr, value]) => {
                const input = document.querySelector(`.attribute-value[data-attribute="${attr}"]`);
                if (input) input.value = value;
            });
        }

        // Restore evasion
        const evasionInput = document.querySelector('#evasionValue');
        if (evasionInput && stats.evasion !== undefined) {
            evasionInput.value = stats.evasion;
        }

        // Restore damage thresholds
        if (stats.damageThresholds) {
            Object.entries(stats.damageThresholds).forEach(([type, value]) => {
                const input = document.querySelector(`#${type}-damage-value`);
                if (input) input.value = value;
            });
        }
    }

    /**
     * Restore localStorage data
     */
    async restoreLocalStorage(localStorageData) {
        if (!localStorageData) return;

        Object.entries(localStorageData).forEach(([key, value]) => {
            try {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, stringValue);
            } catch (error) {
                console.warn(`Failed to restore localStorage key: ${key}`, error);
            }
        });
    }

    /**
     * Restore all trackers
     */
    async restoreTrackers(trackers) {
        if (!trackers) return;

        // Restore each tracker type
        ['hp', 'stress', 'armor'].forEach(type => {
            if (trackers[type]) {
                this.restoreCircleTracker(type, trackers[type]);
            }
        });

        // Restore hope tracker
        if (trackers.hope) {
            this.restoreHopeTracker(trackers.hope);
        }
    }

    /**
     * Restore individual circle tracker
     */
    restoreCircleTracker(type, trackerData) {
        const tracker = document.querySelector(`#${type}-tracker`);
        if (!tracker || !trackerData.circles) return;

        // Clear existing circles
        tracker.innerHTML = '';

        // Recreate circles with saved state
        trackerData.circles.forEach((circleData, index) => {
            const circle = document.createElement('div');
            circle.className = circleData.classes.join(' ');
            if (circleData.style) circle.setAttribute('style', circleData.style);
            tracker.appendChild(circle);
        });

        // Restore localStorage data
        if (trackerData.localStorageData) {
            localStorage.setItem(`zevi-${type}-circles`, JSON.stringify(trackerData.localStorageData));
        }
        if (trackerData.current !== undefined) {
            localStorage.setItem(`zevi-${type}-current`, trackerData.current.toString());
        }
    }

    /**
     * Restore hope tracker
     */
    restoreHopeTracker(hopeData) {
        const tracker = document.querySelector('#hope-tracker');
        if (!tracker || !hopeData.circles) return;

        // Clear existing circles
        tracker.innerHTML = '';

        // Recreate circles with saved state
        hopeData.circles.forEach((circleData, index) => {
            const circle = document.createElement('div');
            circle.className = circleData.classes.join(' ');
            if (circleData.style) circle.setAttribute('style', circleData.style);
            tracker.appendChild(circle);
        });

        // Restore localStorage data
        if (hopeData.localStorageData) {
            localStorage.setItem('zevi-hope', JSON.stringify(hopeData.localStorageData));
        }
    }

    /**
     * Restore equipment data
     */
    async restoreEquipment(equipment) {
        if (!equipment) return;

        // Restore localStorage equipment data
        if (equipment.localStorage) {
            localStorage.setItem('zevi-equipment', JSON.stringify(equipment.localStorage));
        }

        // Restore backpack selection
        const backpackSelect = document.querySelector('#backpack-select');
        if (backpackSelect && equipment.backpackSelection) {
            backpackSelect.value = equipment.backpackSelection;
        }

        // Restore backpack toggle
        const backpackToggle = document.querySelector('#backpackToggle');
        if (backpackToggle && equipment.backpackToggle !== undefined) {
            backpackToggle.checked = equipment.backpackToggle;
        }
    }

    /**
     * Restore character sheet data
     */
    async restoreCharacterSheet(characterSheet) {
        if (!characterSheet) return;

        // Restore active tab
        if (characterSheet.activeTab) {
            const activeButton = document.querySelector(`.tabs button[data-target="${characterSheet.activeTab}"]`);
            if (activeButton) {
                // Remove active class from all tabs
                document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                
                // Activate the correct tab
                activeButton.classList.add('active');
                const targetPanel = document.querySelector(`#${characterSheet.activeTab}`);
                if (targetPanel) targetPanel.classList.add('active');
            }
        }

        // Restore journal data
        if (characterSheet.journal) {
            localStorage.setItem('zevi-journal-entries', JSON.stringify(characterSheet.journal.entries));
            
            // Restore active journal category
            if (characterSheet.journal.activeCategory) {
                const activeButton = document.querySelector(`.journal-category-buttons .button[data-journal-category="${characterSheet.journal.activeCategory}"]`);
                if (activeButton) {
                    document.querySelectorAll('.journal-category-buttons .button').forEach(btn => btn.classList.remove('active'));
                    activeButton.classList.add('active');
                }
            }
        }

        // Restore other character sheet data
        if (characterSheet.details) {
            localStorage.setItem('zevi-character-details', JSON.stringify(characterSheet.details));
        }
        if (characterSheet.experiences) {
            localStorage.setItem('zevi-experiences', JSON.stringify(characterSheet.experiences));
        }
        if (characterSheet.downtime?.projects) {
            localStorage.setItem('zevi-projects', JSON.stringify(characterSheet.downtime.projects));
        }
        if (characterSheet.domainVault) {
            localStorage.setItem('zevi-domain-cards', JSON.stringify(characterSheet.domainVault.cards));
            localStorage.setItem('zevi-selected-domains', JSON.stringify(characterSheet.domainVault.selectedDomains));
            localStorage.setItem('zevi-domain-abilities', JSON.stringify(characterSheet.domainVault.abilities));
        }
        if (characterSheet.effectsFeatures) {
            localStorage.setItem('zevi-active-effects', JSON.stringify(characterSheet.effectsFeatures.activeEffects));
            localStorage.setItem('zevi-features', JSON.stringify(characterSheet.effectsFeatures.features));
            localStorage.setItem('zevi-conditions', JSON.stringify(characterSheet.effectsFeatures.conditions));
        }
    }

    /**
     * Restore layout and positions
     */
    async restoreLayout(layout) {
        if (!layout || !layout.sections) return;

        Object.entries(layout.sections).forEach(([id, sectionData]) => {
            const section = document.querySelector(`.section[data-id="${id}"]`);
            if (section && sectionData.position) {
                if (sectionData.position.top) section.style.top = sectionData.position.top;
                if (sectionData.position.left) section.style.left = sectionData.position.left;
                if (sectionData.position.transform) section.style.transform = sectionData.position.transform;
                if (sectionData.position.width) section.style.width = sectionData.position.width;
                if (sectionData.position.height) section.style.height = sectionData.position.height;
                
                section.style.display = sectionData.visibility ? '' : 'none';
            }
        });

        // Restore container style
        const container = document.querySelector('#draggable-sections');
        if (container && layout.containerStyle) {
            if (layout.containerStyle.flexDirection) container.style.flexDirection = layout.containerStyle.flexDirection;
            if (layout.containerStyle.justifyContent) container.style.justifyContent = layout.containerStyle.justifyContent;
            if (layout.containerStyle.alignItems) container.style.alignItems = layout.containerStyle.alignItems;
        }
    }

    /**
     * Restore UI preferences
     */
    async restoreUIPreferences(uiPreferences) {
        if (!uiPreferences) return;

        // Restore settings values
        const accentPicker = document.querySelector('#accentColorPicker');
        if (accentPicker && uiPreferences.accentColor) {
            accentPicker.value = uiPreferences.accentColor;
        }

        const glassPicker = document.querySelector('#glassColorPicker');
        if (glassPicker && uiPreferences.glassColor) {
            glassPicker.value = uiPreferences.glassColor;
        }

        const opacitySlider = document.querySelector('#glassOpacitySlider');
        if (opacitySlider && uiPreferences.glassOpacity) {
            opacitySlider.value = uiPreferences.glassOpacity;
        }

        const characterCode = document.querySelector('#characterCodeDisplay');
        if (characterCode && uiPreferences.characterCode) {
            characterCode.value = uiPreferences.characterCode;
        }

        // Restore filter states
        const platformFilter = document.querySelector('#platformFilter');
        if (platformFilter && uiPreferences.platformFilter) {
            platformFilter.value = uiPreferences.platformFilter;
        }

        const characterSearch = document.querySelector('#characterSearch');
        if (characterSearch && uiPreferences.characterSearch) {
            characterSearch.value = uiPreferences.characterSearch;
        }

        // Restore scroll positions
        if (uiPreferences.scrollPositions) {
            const { window: windowPos, body: bodyPos } = uiPreferences.scrollPositions;
            if (windowPos) window.scrollTo(windowPos.x, windowPos.y);
            if (bodyPos) {
                document.body.scrollLeft = bodyPos.x;
                document.body.scrollTop = bodyPos.y;
            }
        }
    }

    /**
     * Restore customizations
     */
    async restoreCustomizations(customizations) {
        if (!customizations) return;

        const root = document.documentElement;

        // Restore CSS variables
        if (customizations.cssVariables) {
            Object.entries(customizations.cssVariables).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        }

        // Restore inline styles
        if (customizations.inlineStyles) {
            Object.entries(customizations.inlineStyles).forEach(([identifier, style]) => {
                const element = document.getElementById(identifier) || document.querySelector(`.${identifier}`);
                if (element) {
                    element.setAttribute('style', style);
                }
            });
        }
    }

    /**
     * Refresh all systems after restoration
     */
    refreshAllSystems() {
        console.log('🔄 Refreshing all systems...');

        // Trigger refresh events for various systems
        try {
            // Refresh circles if functions exist
            if (window.refreshHPCircles) window.refreshHPCircles();
            if (window.refreshStressCircles) window.refreshStressCircles();
            if (window.refreshArmorCircles) window.refreshArmorCircles();
            if (window.refreshHopeTracker) window.refreshHopeTracker();
            
            // Refresh equipment if function exists
            if (window.refreshEquipmentDisplay) window.refreshEquipmentDisplay();
            
            // Refresh journal if function exists
            if (window.refreshJournalEntries) window.refreshJournalEntries();
            
            // Refresh experiences if function exists
            if (window.refreshExperiencesList) window.refreshExperiencesList();
            
            // Refresh details if function exists
            if (window.refreshDetailsDisplay) window.refreshDetailsDisplay();

            // Dispatch custom events for any listeners
            window.dispatchEvent(new CustomEvent('characterDataRestored'));
            
        } catch (error) {
            console.warn('Some systems failed to refresh:', error);
        }
    }

    /**
     * Save character data to localStorage
     */
    saveCharacter(characterId = null) {
        const id = characterId || this.getCurrentCharacter();
        if (!id) {
            console.error('❌ No character ID provided for saving');
            return false;
        }

        try {
            const characterData = this.captureCompleteCharacterState();
            const saveKey = `zevi-comprehensive-character-${id}`;
            
            localStorage.setItem(saveKey, JSON.stringify(characterData));
            localStorage.setItem('zevi-current-character-id', id);
            
            console.log(`💾 Character ${id} saved successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to save character ${id}:`, error);
            return false;
        }
    }

    /**
     * Load character data from localStorage
     */
    async loadCharacter(characterId) {
        if (!characterId) {
            console.error('❌ No character ID provided for loading');
            return false;
        }

        try {
            const saveKey = `zevi-comprehensive-character-${characterId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (!savedData) {
                console.warn(`⚠️ No saved data found for character ${characterId}`);
                return false;
            }

            const characterData = JSON.parse(savedData);
            await this.restoreCompleteCharacterState(characterData);
            
            this.setCurrentCharacter(characterId);
            console.log(`📂 Character ${characterId} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load character ${characterId}:`, error);
            return false;
        }
    }

    /**
     * Delete character data
     */
    deleteCharacter(characterId) {
        if (!characterId) {
            console.error('❌ No character ID provided for deletion');
            return false;
        }

        try {
            const saveKey = `zevi-comprehensive-character-${characterId}`;
            localStorage.removeItem(saveKey);
            
            console.log(`🗑️ Character ${characterId} deleted successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete character ${characterId}:`, error);
            return false;
        }
    }

    /**
     * Get list of all saved characters
     */
    getAllCharacters() {
        const characters = [];
        const prefix = 'zevi-comprehensive-character-';
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                try {
                    const characterId = key.replace(prefix, '');
                    const characterData = JSON.parse(localStorage.getItem(key));
                    
                    characters.push({
                        id: characterId,
                        name: characterData.basicInfo?.name || 'Unnamed Character',
                        level: characterData.basicInfo?.level || '1',
                        imageUrl: characterData.basicInfo?.imageUrl || '',
                        lastModified: characterData.captureTimestamp || new Date().toISOString(),
                        dataSize: JSON.stringify(characterData).length
                    });
                } catch (error) {
                    console.warn(`Failed to parse character data for ${key}:`, error);
                }
            }
        });
        
        return characters.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    }

    /**
     * Clear all character data
     */
    clearAllCharacters() {
        const prefix = 'zevi-comprehensive-character-';
        const keysToRemove = [];
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('zevi-current-character-id');
        
        console.log(`🧹 Cleared ${keysToRemove.length} character save files`);
        return keysToRemove.length;
    }
}

// Initialize and expose globally
window.ComprehensiveCharacterSave = ComprehensiveCharacterSave;
window.comprehensiveCharacterSave = new ComprehensiveCharacterSave();

console.log('🚀 ComprehensiveCharacterSave system loaded and ready');