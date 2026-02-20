// Perform search
os.integrations.bhekwork.search("BhekOS tutorial", "youtube");

// Voice search
os.integrations.bhekwork.voiceSearch((text) => {
    console.log("Searching for:", text);
});

// Get weather
const temp = await os.integrations.bhekwork.getWeather("Accra");

// Generate password
const password = os.integrations.bhekwork.generatePassword();

// Count words
const count = os.integrations.bhekwork.countWords("Hello world");

// Add bookmark
os.integrations.bhekwork.addBookmark("https://example.com", "Example");

// Get greeting
const greeting = os.integrations.bhekwork.getGreeting();

// Get status
const status = os.integrations.bhekwork.getStatus();

// Export data
os.integrations.bhekwork.exportData();

// Open in new tab
os.integrations.bhekwork.openInNewTab();
