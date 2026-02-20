// BhekThink Integration Tests
const BhekThinkTests = {
    runAll() {
        console.log('🤖 Running BhekThink Tests...');
        const results = { passed: 0, failed: 0, total: 0 };
        
        this.testConnection(results);
        this.testLanguageSupport(results);
        this.testImageGeneration(results);
        this.testVoiceSupport(results);
        this.testHistory(results);
        this.testAuthentication(results);
        
        console.log(`\n📊 BhekThink Test Results: ${results.passed}/${results.total} passed`);
        return results;
    },

    testConnection(results) {
        results.total++;
        try {
            const status = window.os?.integrations?.bhekthink?.getStatus();
            if (status) {
                console.log('✅ Connection test passed');
                results.passed++;
            } else {
                throw new Error('BhekThink not initialized');
            }
        } catch (error) {
            console.log('❌ Connection test failed:', error.message);
            results.failed++;
        }
    },

    testLanguageSupport(results) {
        results.total++;
        try {
            const bhekthink = window.os?.integrations?.bhekthink;
            const languages = ['English', 'Twi', 'French', 'Spanish', 'Arabic', 'Chinese'];
            
            bhekthink.setLanguage('Twi');
            const currentLang = bhekthink.getLanguage();
            
            if (languages.includes(currentLang)) {
                console.log('✅ Language support test passed');
                results.passed++;
            } else {
                throw new Error('Language support failed');
            }
        } catch (error) {
            console.log('❌ Language support test failed:', error.message);
            results.failed++;
        }
    },

    testImageGeneration(results) {
        results.total++;
        try {
            const bhekthink = window.os?.integrations?.bhekthink;
            const imagePromise = bhekthink.generateImage('test image');
            
            if (imagePromise instanceof Promise) {
                console.log('✅ Image generation test passed');
                results.passed++;
            } else {
                throw new Error('Image generation not available');
            }
        } catch (error) {
            console.log('❌ Image generation test failed:', error.message);
            results.failed++;
        }
    },

    testVoiceSupport(results) {
        results.total++;
        try {
            const bhekthink = window.os?.integrations?.bhekthink;
            const hasVoice = typeof bhekthink.speak === 'function' && 
                            typeof bhekthink.listen === 'function';
            
            if (hasVoice) {
                console.log('✅ Voice support test passed');
                results.passed++;
            } else {
                throw new Error('Voice support missing');
            }
        } catch (error) {
            console.log('❌ Voice support test failed:', error.message);
            results.failed++;
        }
    },

    testHistory(results) {
        results.total++;
        try {
            const bhekthink = window.os?.integrations?.bhekthink;
            const initialCount = bhekthink.conversationHistory.length;
            
            bhekthink.saveToHistory('test query', 'test response');
            const newCount = bhekthink.conversationHistory.length;
            
            if (newCount > initialCount) {
                console.log('✅ History test passed');
                results.passed++;
            } else {
                throw new Error('History not saving');
            }
        } catch (error) {
            console.log('❌ History test failed:', error.message);
            results.failed++;
        }
    },

    testAuthentication(results) {
        results.total++;
        try {
            const bhekthink = window.os?.integrations?.bhekthink;
            const authPromise = bhekthink.signIn();
            
            if (authPromise instanceof Promise) {
                console.log('✅ Authentication test passed');
                results.passed++;
            } else {
                throw new Error('Authentication not available');
            }
        } catch (error) {
            console.log('❌ Authentication test failed:', error.message);
            results.failed++;
        }
    },

    async testResponseTime() {
        console.log('⏱️ Testing response time...');
        const bhekthink = window.os?.integrations?.bhekthink;
        
        const start = Date.now();
        await bhekthink.processMessage('Hello');
        const time = Date.now() - start;
        
        console.log(`Response time: ${time}ms`);
        return time;
    },

    testFallbackMode() {
        console.log('🔄 Testing fallback mode...');
        const bhekthink = window.os?.integrations?.bhekthink;
        
        // Simulate disconnect
        bhekthink.isConnected = false;
        const response = bhekthink.fallbackResponse('Hello');
        
        if (response && response.length > 0) {
            console.log('✅ Fallback mode working');
            return true;
        } else {
            console.log('❌ Fallback mode failed');
            return false;
        }
    }
};

// Auto-run if in test mode
if (window.location.hash === '#test-bhekthink') {
    setTimeout(() => BhekThinkTests.runAll(), 1000);
          }
