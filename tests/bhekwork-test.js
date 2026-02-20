// BhekWork Integration Tests
const BhekWorkTests = {
    runAll() {
        console.log('🌐 Running BhekWork Tests...');
        const results = { passed: 0, failed: 0, total: 0 };
        
        this.testConnection(results);
        this.testSearchEngines(results);
        this.testVoiceSearch(results);
        this.testBookmarks(results);
        this.testHistory(results);
        this.testUtilities(results);
        
        console.log(`\n📊 BhekWork Test Results: ${results.passed}/${results.total} passed`);
        return results;
    },

    testConnection(results) {
        results.total++;
        try {
            const status = window.os?.integrations?.bhekwork?.getStatus();
            if (status) {
                console.log('✅ Connection test passed');
                results.passed++;
            } else {
                throw new Error('BhekWork not initialized');
            }
        } catch (error) {
            console.log('❌ Connection test failed:', error.message);
            results.failed++;
        }
    },

    testSearchEngines(results) {
        results.total++;
        try {
            const bhekwork = window.os?.integrations?.bhekwork;
            const engines = bhekwork.config.supportedEngines;
            const defaultEngine = bhekwork.config.defaultEngine;
            
            if (engines.includes('google') && engines.includes('youtube') && 
                engines.includes('github') && defaultEngine) {
                console.log('✅ Search engines test passed');
                results.passed++;
            } else {
                throw new Error('Search engines misconfigured');
            }
        } catch (error) {
            console.log('❌ Search engines test failed:', error.message);
            results.failed++;
        }
    },

    testVoiceSearch(results) {
        results.total++;
        try {
            const bhekwork = window.os?.integrations?.bhekwork;
            const hasVoice = typeof bhekwork.voiceSearch === 'function';
            
            if (hasVoice) {
                console.log('✅ Voice search test passed');
                results.passed++;
            } else {
                throw new Error('Voice search not available');
            }
        } catch (error) {
            console.log('❌ Voice search test failed:', error.message);
            results.failed++;
        }
    },

    testBookmarks(results) {
        results.total++;
        try {
            const bhekwork = window.os?.integrations?.bhekwork;
            const initialCount = bhekwork.bookmarks.length;
            
            bhekwork.addBookmark('https://test.com', 'Test Site');
            bhekwork.removeBookmark('https://test.com');
            const finalCount = bhekwork.bookmarks.length;
            
            if (finalCount === initialCount) {
                console.log('✅ Bookmarks test passed');
                results.passed++;
            } else {
                throw new Error('Bookmarks not working');
            }
        } catch (error) {
            console.log('❌ Bookmarks test failed:', error.message);
            results.failed++;
        }
    },

    testHistory(results) {
        results.total++;
        try {
            const bhekwork = window.os?.integrations?.bhekwork;
            const initialCount = bhekwork.searchHistory.length;
            
            bhekwork.addToHistory('test query', 'google');
            const newCount = bhekwork.searchHistory.length;
            
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

    testUtilities(results) {
        results.total++;
        try {
            const bhekwork = window.os?.integrations?.bhekwork;
            
            // Test password generator
            const password = bhekwork.generatePassword();
            if (password.length < 8) throw new Error('Password too short');
            
            // Test word counter
            const count = bhekwork.countWords('This is a test sentence');
            if (count !== 5) throw new Error('Word counter incorrect');
            
            console.log('✅ Utilities test passed');
            results.passed++;
        } catch (error) {
            console.log('❌ Utilities test failed:', error.message);
            results.failed++;
        }
    },

    async testWeather() {
        console.log('☁️ Testing weather API...');
        const bhekwork = window.os?.integrations?.bhekwork;
        
        const weather = await bhekwork.getWeather('Accra');
        if (weather && weather !== 'N/A') {
            console.log('✅ Weather test passed:', weather);
            return true;
        } else {
            console.log('❌ Weather test failed');
            return false;
        }
    },

    testGreeting() {
        console.log('👋 Testing greeting...');
        const bhekwork = window.os?.integrations?.bhekwork;
        
        const greeting = bhekwork.getGreeting();
        const validGreetings = ['MORNING', 'AFTERNOON', 'EVENING'];
        
        if (validGreetings.includes(greeting)) {
            console.log('✅ Greeting test passed:', greeting);
            return true;
        } else {
            console.log('❌ Greeting test failed');
            return false;
        }
    },

    testFallbackMode() {
        console.log('🔄 Testing fallback mode...');
        const bhekwork = window.os?.integrations?.bhekwork;
        
        bhekwork.fallbackMode = true;
        const result = bhekwork.fallbackSearch('test', 'google');
        
        if (result.success && result.mode === 'fallback') {
            console.log('✅ Fallback mode working');
            return true;
        } else {
            console.log('❌ Fallback mode failed');
            return false;
        }
    }
};

// Auto-run if in test mode
if (window.location.hash === '#test-bhekwork') {
    setTimeout(() => BhekWorkTests.runAll(), 1000);
}
