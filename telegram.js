// Telegram Web App API Integration

// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    // Expand the app to full height
    tg.expand();

    // Enable closing confirmation
    tg.enableClosingConfirmation();

    // Apply Telegram theme colors
    applyTelegramTheme();

    // Setup back button (optional)
    setupBackButton();

    // Setup main button (optional)
    setupMainButton();

    // Listen for theme changes
    tg.onEvent('themeChanged', applyTelegramTheme);

    console.log('Telegram Web App initialized');
    console.log('Version:', tg.version);
    console.log('Platform:', tg.platform);
    console.log('User:', tg.initDataUnsafe?.user);
} else {
    console.warn('Telegram Web App not available. Running in browser mode.');
}

// Apply Telegram theme colors to CSS variables
function applyTelegramTheme() {
    if (!tg) return;

    const themeParams = tg.themeParams;
    const root = document.documentElement;

    // Apply theme colors
    if (themeParams.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
        root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
    }
    if (themeParams.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
    }
    if (themeParams.link_color) {
        root.style.setProperty('--tg-theme-link-color', themeParams.link_color);
    }
    if (themeParams.button_color) {
        root.style.setProperty('--tg-theme-button-color', themeParams.button_color);
    }
    if (themeParams.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
    }
    if (themeParams.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color);
    }

    // Set color scheme for better browser compatibility
    const isDark = isColorDark(themeParams.bg_color || '#ffffff');
    root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
}

// Setup back button (example - can be customized)
function setupBackButton() {
    if (!tg) return;

    // Show back button when viewing history or in certain modes
    // This is just an example - customize based on your needs
    
    tg.BackButton.onClick(() => {
        // Handle back button click
        // For example, scroll to top or change mode
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Setup main button (example - can be customized)
function setupMainButton() {
    if (!tg) return;

    // Example: Show main button with custom action
    // tg.MainButton.setText('Поделиться');
    // tg.MainButton.onClick(() => {
    //     // Share app or results
    //     shareApp();
    // });
}

// Share functionality
function shareApp() {
    if (!tg) return;

    const shareText = '🎲 Попробуй Decision Maker - приложение для принятия решений!';
    const shareUrl = 'https://t.me/your_bot/app'; // Replace with your actual bot URL

    // Option 1: Share to Telegram
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);

    // Option 2: Use Web Share API (if available)
    // if (navigator.share) {
    //     navigator.share({
    //         title: 'Decision Maker',
    //         text: shareText,
    //         url: shareUrl
    //     });
    // }
}

// Send data to bot (example)
function sendDataToBot(data) {
    if (!tg) return;

    try {
        tg.sendData(JSON.stringify(data));
        tg.close();
    } catch (e) {
        console.error('Failed to send data:', e);
    }
}

// Utility: Check if color is dark
function isColorDark(color) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
}

// Haptic feedback helpers (used throughout the app)
const haptic = {
    light: () => tg?.HapticFeedback.impactOccurred('light'),
    medium: () => tg?.HapticFeedback.impactOccurred('medium'),
    heavy: () => tg?.HapticFeedback.impactOccurred('heavy'),
    success: () => tg?.HapticFeedback.notificationOccurred('success'),
    warning: () => tg?.HapticFeedback.notificationOccurred('warning'),
    error: () => tg?.HapticFeedback.notificationOccurred('error'),
    selection: () => tg?.HapticFeedback.selectionChanged()
};

// Viewport handling for better mobile experience
function handleViewportHeight() {
    // Fix for mobile browsers (especially iOS Safari)
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

handleViewportHeight();

// Cloud Storage helpers (for storing user data in Telegram)
const cloudStorage = {
    async get(key) {
        if (!tg?.CloudStorage) return null;
        
        return new Promise((resolve) => {
            tg.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    console.error('CloudStorage get error:', error);
                    resolve(null);
                } else {
                    resolve(value);
                }
            });
        });
    },

    async set(key, value) {
        if (!tg?.CloudStorage) return false;
        
        return new Promise((resolve) => {
            tg.CloudStorage.setItem(key, value, (error, success) => {
                if (error) {
                    console.error('CloudStorage set error:', error);
                    resolve(false);
                } else {
                    resolve(success);
                }
            });
        });
    },

    async remove(key) {
        if (!tg?.CloudStorage) return false;
        
        return new Promise((resolve) => {
            tg.CloudStorage.removeItem(key, (error, success) => {
                if (error) {
                    console.error('CloudStorage remove error:', error);
                    resolve(false);
                } else {
                    resolve(success);
                }
            });
        });
    }
};

// Optional: Load history from Telegram Cloud Storage instead of localStorage
async function syncHistoryWithCloud() {
    if (!tg?.CloudStorage) return;

    try {
        // Load from cloud
        const cloudHistory = await cloudStorage.get('decision_history');
        if (cloudHistory) {
            localStorage.setItem('decisionmaker_history', cloudHistory);
        }

        // Save to cloud when history changes
        window.addEventListener('beforeunload', async () => {
            const localHistory = localStorage.getItem('decisionmaker_history');
            if (localHistory) {
                await cloudStorage.set('decision_history', localHistory);
            }
        });
    } catch (e) {
        console.error('Failed to sync with cloud:', e);
    }
}

// Initialize cloud sync
if (tg?.CloudStorage) {
    syncHistoryWithCloud();
}

// Export for use in app.js
window.TelegramApp = {
    tg,
    haptic,
    cloudStorage,
    shareApp,
    sendDataToBot
};
