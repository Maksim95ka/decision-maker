// Decision Maker - Main Application Logic

class DecisionMaker {
    constructor() {
        this.currentMode = 'yesno';
        this.history = this.loadHistory();
        this.options = [];
        this.maxOptions = 10;
        
        this.init();
    }

    init() {
        this.setupModeButtons();
        this.setupYesNoMode();
        this.setupCoinMode();
        this.setupWheelMode();
        this.setupHistory();
        this.renderHistory();
    }

    // Mode Switching
    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });
    }

    switchMode(mode) {
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update active content
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${mode}Mode`).classList.add('active');

        this.currentMode = mode;
    }

    // Yes/No Mode
    setupYesNoMode() {
        const btn = document.getElementById('yesnoBtn');
        const input = document.getElementById('questionInput');
        const resultDiv = document.getElementById('yesnoResult');

        btn.addEventListener('click', () => {
            const question = input.value.trim() || 'Вопрос не задан';
            this.makeYesNoDecision(question, resultDiv);
        });

        // Enter key support
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btn.click();
            }
        });
    }

    makeYesNoDecision(question, resultDiv) {
        // Trigger haptic feedback
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // Array of possible answers
        const answers = [
            { icon: '✅', text: 'Да!', type: 'yes' },
            { icon: '❌', text: 'Нет!', type: 'no' },
            { icon: '🤔', text: 'Может быть...', type: 'maybe' },
            { icon: '💯', text: 'Определённо да!', type: 'yes' },
            { icon: '🚫', text: 'Определённо нет!', type: 'no' },
            { icon: '⏰', text: 'Сейчас не время', type: 'no' },
            { icon: '🎯', text: 'Попробуй!', type: 'yes' },
            { icon: '⚠️', text: 'Подумай ещё', type: 'maybe' }
        ];

        // Animate before showing result
        resultDiv.innerHTML = `
            <div class="result-icon">🎲</div>
            <div class="result-text">Думаю...</div>
        `;

        setTimeout(() => {
            const answer = answers[Math.floor(Math.random() * answers.length)];
            
            resultDiv.innerHTML = `
                <div class="result-icon">${answer.icon}</div>
                <div class="result-text">${answer.text}</div>
                ${question !== 'Вопрос не задан' ? `<div class="result-subtext">${question}</div>` : ''}
            `;

            resultDiv.classList.add('result-success');
            setTimeout(() => resultDiv.classList.remove('result-success'), 500);

            // Save to history
            this.addToHistory({
                mode: 'yesno',
                question: question,
                result: answer.text,
                icon: '🤔'
            });

            // Haptic feedback on result
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        }, 800);
    }

    // Coin Flip Mode
    setupCoinMode() {
        const btn = document.getElementById('coinBtn');
        const coin = document.getElementById('coin');
        const resultDiv = document.getElementById('coinResult');

        btn.addEventListener('click', () => {
            this.flipCoin(coin, resultDiv, btn);
        });
    }

    flipCoin(coin, resultDiv, btn) {
        // Disable button during flip
        btn.disabled = true;

        // Trigger haptic feedback
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        }

        // Reset coin
        coin.style.transform = 'rotateY(0)';
        coin.classList.remove('flipping');

        // Random result
        const isHeads = Math.random() < 0.5;
        const rotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
        const finalRotation = rotations * 360 + (isHeads ? 0 : 180);

        // Start animation
        setTimeout(() => {
            coin.classList.add('flipping');
            coin.style.transform = `rotateY(${finalRotation}deg)`;
        }, 50);

        // Show result
        setTimeout(() => {
            const result = isHeads ? 'ОРЁЛ' : 'РЕШКА';
            const icon = isHeads ? '🦅' : '🪙';
            
            resultDiv.innerHTML = `
                <div class="result-icon">${icon}</div>
                <div class="result-text">${result}</div>
            `;

            resultDiv.classList.add('result-success');
            setTimeout(() => resultDiv.classList.remove('result-success'), 500);

            // Save to history
            this.addToHistory({
                mode: 'coin',
                question: 'Монетка',
                result: result,
                icon: '🪙'
            });

            // Haptic feedback
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

            btn.disabled = false;
        }, 1500);
    }

    // Wheel Mode
    setupWheelMode() {
        const addBtn = document.getElementById('addOptionBtn');
        const input = document.getElementById('optionInput');
        const selectBtn = document.getElementById('wheelBtn');
        const resultDiv = document.getElementById('wheelResult');

        addBtn.addEventListener('click', () => {
            this.addOption(input);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOption(input);
            }
        });

        selectBtn.addEventListener('click', () => {
            this.selectRandomOption(resultDiv, selectBtn);
        });
    }

    addOption(input) {
        const text = input.value.trim();
        
        if (!text) {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
            return;
        }

        if (this.options.length >= this.maxOptions) {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showAlert(`Максимум ${this.maxOptions} вариантов!`);
            }
            return;
        }

        this.options.push(text);
        input.value = '';
        this.renderOptions();
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    removeOption(index) {
        this.options.splice(index, 1);
        this.renderOptions();
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    renderOptions() {
        const list = document.getElementById('optionsList');
        const count = document.getElementById('optionCount');
        const selectBtn = document.getElementById('wheelBtn');

        count.textContent = `${this.options.length}/${this.maxOptions}`;

        if (this.options.length === 0) {
            list.innerHTML = '';
            selectBtn.disabled = true;
            return;
        }

        selectBtn.disabled = this.options.length < 2;

        list.innerHTML = this.options.map((option, index) => `
            <div class="option-item">
                <span class="option-text">${this.escapeHtml(option)}</span>
                <button class="remove-btn" onclick="app.removeOption(${index})">❌</button>
            </div>
        `).join('');
    }

    selectRandomOption(resultDiv, btn) {
        if (this.options.length < 2) return;

        btn.disabled = true;

        // Trigger haptic feedback
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }

        // Animate selection
        let counter = 0;
        const maxIterations = 20;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * this.options.length);
            const randomOption = this.options[randomIndex];
            
            resultDiv.innerHTML = `
                <div class="result-icon">🎯</div>
                <div class="result-text">${this.escapeHtml(randomOption)}</div>
            `;

            counter++;
            if (counter >= maxIterations) {
                clearInterval(interval);
                
                // Final selection
                const finalIndex = Math.floor(Math.random() * this.options.length);
                const finalOption = this.options[finalIndex];
                
                resultDiv.innerHTML = `
                    <div class="result-icon">🎉</div>
                    <div class="result-text">${this.escapeHtml(finalOption)}</div>
                `;

                resultDiv.classList.add('result-success');
                setTimeout(() => resultDiv.classList.remove('result-success'), 500);

                // Save to history
                this.addToHistory({
                    mode: 'wheel',
                    question: `Выбор из ${this.options.length} вариантов`,
                    result: finalOption,
                    icon: '🎯'
                });

                // Haptic feedback
                if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }

                btn.disabled = false;
            }
        }, 100);
    }

    // History Management
    setupHistory() {
        const clearBtn = document.getElementById('clearHistoryBtn');
        
        clearBtn.addEventListener('click', () => {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showConfirm('Очистить всю историю?', (confirmed) => {
                    if (confirmed) {
                        this.clearHistory();
                    }
                });
            } else {
                if (confirm('Очистить всю историю?')) {
                    this.clearHistory();
                }
            }
        });
    }

    addToHistory(item) {
        const historyItem = {
            ...item,
            timestamp: Date.now()
        };

        this.history.unshift(historyItem);
        
        // Keep only last 20 items
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            list.innerHTML = '<div class="empty-history"><span>История пуста</span></div>';
            return;
        }

        list.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-time">${this.formatTime(item.timestamp)}</div>
                <div class="history-content">
                    <span class="history-mode">${item.icon}</span>
                    <span class="history-text">${this.escapeHtml(item.question)}</span>
                    <span class="history-result">${this.escapeHtml(item.result)}</span>
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    }

    // Storage
    saveHistory() {
        try {
            localStorage.setItem('decisionmaker_history', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('decisionmaker_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    }

    // Utilities
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // Less than 1 minute
        if (diff < 60000) {
            return 'Только что';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        }

        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} ч назад`;
        }

        // Format as date
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new DecisionMaker();
    });
} else {
    app = new DecisionMaker();
}
