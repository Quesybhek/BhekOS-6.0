// Calculator App
const Calculator = {
    load(view, os) {
        this.os = os;
        this.history = BhekStorage.load('calcHistory', []);
        this.memory = 0;
        
        view.innerHTML = `
            <div style="padding: 20px; height: 100%; display: flex; flex-direction: column;">
                <h2 style="margin-bottom: 16px;">🧮 Calculator</h2>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; flex: 1; display: flex; flex-direction: column;">
                    <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div id="calc-expression" style="font-size: 14px; opacity: 0.7; min-height: 20px; text-align: right;"></div>
                        <input type="text" id="calc-display" readonly 
                               style="width: 100%; background: transparent; border: none; padding: 8px 0; font-size: 32px; text-align: right; outline: none;"
                               value="0">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px;">
                        <button onclick="Calculator.clear()" style="background: #ff5252;">C</button>
                        <button onclick="Calculator.clearEntry()" style="background: #ff9800;">CE</button>
                        <button onclick="Calculator.backspace()" style="background: rgba(255,255,255,0.1);">⌫</button>
                        <button onclick="Calculator.memoryRecall()" style="background: rgba(255,255,255,0.1);">MR</button>
                        <button onclick="Calculator.memoryClear()" style="background: rgba(255,255,255,0.1);">MC</button>
                        
                        <button onclick="Calculator.memoryAdd()" style="background: rgba(255,255,255,0.1);">M+</button>
                        <button onclick="Calculator.memorySubtract()" style="background: rgba(255,255,255,0.1);">M-</button>
                        <button onclick="Calculator.input('(')" style="background: rgba(255,255,255,0.1);">(</button>
                        <button onclick="Calculator.input(')')" style="background: rgba(255,255,255,0.1);">)</button>
                        <button onclick="Calculator.input('%')" style="background: rgba(255,255,255,0.1);">%</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; flex: 1;">
                        <button onclick="Calculator.input('7')">7</button>
                        <button onclick="Calculator.input('8')">8</button>
                        <button onclick="Calculator.input('9')">9</button>
                        <button onclick="Calculator.input('/')" style="background: rgba(255,255,255,0.1);">÷</button>
                        
                        <button onclick="Calculator.input('4')">4</button>
                        <button onclick="Calculator.input('5')">5</button>
                        <button onclick="Calculator.input('6')">6</button>
                        <button onclick="Calculator.input('*')" style="background: rgba(255,255,255,0.1);">×</button>
                        
                        <button onclick="Calculator.input('1')">1</button>
                        <button onclick="Calculator.input('2')">2</button>
                        <button onclick="Calculator.input('3')">3</button>
                        <button onclick="Calculator.input('-')" style="background: rgba(255,255,255,0.1);">-</button>
                        
                        <button onclick="Calculator.input('0')" style="grid-column: span 2;">0</button>
                        <button onclick="Calculator.input('.')">.</button>
                        <button onclick="Calculator.input('+')" style="background: rgba(255,255,255,0.1);">+</button>
                        
                        <button onclick="Calculator.calculate()" style="background: var(--accent); grid-column: span 4;">=</button>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 8px;">History</h4>
                        <div id="calc-history" style="max-height: 100px; overflow-y: auto; font-size: 12px;"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderHistory();
    },

    input(value) {
        const display = document.getElementById('calc-display');
        const expression = document.getElementById('calc-expression');
        
        if (display.value === '0' && !'+-*/.%)'.includes(value)) {
            display.value = value;
        } else {
            display.value += value;
        }
        
        // Update expression display
        expression.textContent = display.value;
    },

    clear() {
        document.getElementById('calc-display').value = '0';
        document.getElementById('calc-expression').textContent = '';
    },

    clearEntry() {
        document.getElementById('calc-display').value = '0';
    },

    backspace() {
        const display = document.getElementById('calc-display');
        display.value = display.value.slice(0, -1) || '0';
        document.getElementById('calc-expression').textContent = display.value;
    },

    calculate() {
        const display = document.getElementById('calc-display');
        const expression = document.getElementById('calc-expression');
        
        try {
            // Replace symbols
            let expr = display.value
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/%/g, '/100');
            
            // Evaluate safely
            const result = Function('"use strict"; return (' + expr + ')')();
            
            // Show result
            expression.textContent = display.value + ' =';
            display.value = result.toString();
            
            // Save to history
            this.history.push(`${expr} = ${result}`);
            if (this.history.length > 20) this.history.shift();
            BhekStorage.save('calcHistory', this.history);
            this.renderHistory();
            
        } catch (error) {
            expression.textContent = 'Error';
            display.value = 'Error';
            setTimeout(() => this.clear(), 1000);
        }
    },

    memoryAdd() {
        const value = parseFloat(document.getElementById('calc-display').value) || 0;
        this.memory += value;
    },

    memorySubtract() {
        const value = parseFloat(document.getElementById('calc-display').value) || 0;
        this.memory -= value;
    },

    memoryRecall() {
        document.getElementById('calc-display').value = this.memory.toString();
    },

    memoryClear() {
        this.memory = 0;
    },

    renderHistory() {
        const container = document.getElementById('calc-history');
        if (!container) return;
        
        container.innerHTML = this.history.map(item => 
            `<div style="padding: 4px; border-bottom: 1px solid rgba(255,255,255,0.1);">${item}</div>`
        ).join('') || '<div style="opacity: 0.6;">No history</div>';
    }
};

window.Calculator = Calculator;
