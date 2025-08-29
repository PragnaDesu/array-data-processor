// Array Data Processor - Frontend (connects to Node.js backend)

// Configuration
const API_BASE_URL = 'https://array-data-processor.onrender.com';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    // Set up navigation
    setupSmoothScrolling();
    
    // Set up form handling
    setupFormHandling();
    
    // Pre-fill default input
    setDefaultInput();
    
    // Check backend connection
    checkBackendHealth();
    
    console.log('App initialized successfully');
}

// Check if backend is running
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            showConnectionStatus('✅ Backend connected', 'success');
            console.log('✅ Backend is running');
        } else {
            showConnectionStatus('⚠️ Backend issues detected', 'warning');
        }
    } catch (error) {
        showConnectionStatus('❌ Backend not connected', 'error');
        console.error('❌ Backend connection failed:', error);
        
        // Show instructions to user
        setTimeout(() => {
            showConnectionInstructions();
        }, 2000);
    }
}

// Show connection status
function showConnectionStatus(message, type) {
    const statusElement = document.getElementById('backendStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `connection-status ${type}`;
        statusElement.style.display = 'block';
    }
}

// Show backend connection instructions
function showConnectionInstructions() {
    const instructionsHTML = `
        <div class="connection-instructions">
            <h4>🚀 To connect to the backend:</h4>
            <ol>
                <li>Make sure you have Node.js installed</li>
                <li>Open terminal in the backend folder</li>
                <li>Run: <code>npm install</code></li>
                <li>Run: <code>npm start</code></li>
                <li>Backend should start at http://localhost:3001</li>
                <li>Refresh this page</li>
            </ol>
            <p><strong>Note:</strong> Without backend, the app will use client-side processing as fallback.</p>
        </div>
    `;
    
    const outputContainer = document.getElementById('apiResponse');
    if (outputContainer) {
        outputContainer.innerHTML = instructionsHTML;
    }
}

// Smooth scrolling navigation
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('href');
            console.log('Navigation clicked:', targetId);
            
            if (targetId && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Remove active class from all nav links
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    const offsetTop = targetElement.offsetTop - 100;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Form handling setup
function setupFormHandling() {
    const processBtn = document.getElementById('processBtn');
    const arrayInput = document.getElementById('arrayInput');
    
    console.log('Setting up form handling...');
    console.log('Process button found:', processBtn !== null);
    console.log('Array input found:', arrayInput !== null);
    
    if (processBtn) {
        processBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Process button clicked');
            handleProcessArray();
        });
    } else {
        console.error('❌ processBtn element not found!');
    }
    
    if (arrayInput) {
        // Clear error messages when user starts typing
        arrayInput.addEventListener('input', function() {
            hideErrorMessage();
        });
        
        // Handle Ctrl+Enter to submit
        arrayInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                handleProcessArray();
            }
        });
    } else {
        console.error('❌ arrayInput element not found!');
    }
    
    // Check if all required elements exist
    const apiResponse = document.getElementById('apiResponse');
    const backendStatus = document.getElementById('backendStatus');
    const errorMessage = document.getElementById('errorMessage');
    
    console.log('Required elements check:');
    console.log('- processBtn:', processBtn !== null);
    console.log('- arrayInput:', arrayInput !== null);
    console.log('- apiResponse:', apiResponse !== null);
    console.log('- backendStatus:', backendStatus !== null);
    console.log('- errorMessage:', errorMessage !== null);
    
    if (!processBtn || !arrayInput || !apiResponse) {
        console.error('❌ Required DOM elements not found');
        const missingElements = [];
        if (!processBtn) missingElements.push('processBtn');
        if (!arrayInput) missingElements.push('arrayInput');
        if (!apiResponse) missingElements.push('apiResponse');
        
        alert(`Missing required elements: ${missingElements.join(', ')}\n\nPlease check your HTML file has elements with these IDs.`);
        return;
    }
}

// Set default input data
function setDefaultInput() {
    const arrayInput = document.getElementById('arrayInput');
    if (arrayInput) {
        const defaultData = {
            "data": ["a", "1", "2", "b", "B", "$", "3"]
        };
        arrayInput.value = JSON.stringify(defaultData, null, 2);
    }
}

// Handle array processing (calls backend API)
async function handleProcessArray() {
    console.log('Processing array...');
    
    const arrayInput = document.getElementById('arrayInput');
    const processBtn = document.getElementById('processBtn');
    const outputContainer = document.getElementById('apiResponse');
    
    if (!arrayInput || !outputContainer) {
        console.error('Required DOM elements not found');
        alert('Error: Required form elements not found. Please check your HTML.');
        return;
    }
    
    // Show loading state
    showLoadingState(true);
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.textContent = 'Processing...';
    }
    
    try {
        // Parse input JSON
        const inputText = arrayInput.value.trim();
        if (!inputText) {
            throw new Error('Please enter JSON data');
        }
        
        let inputData;
        try {
            inputData = JSON.parse(inputText);
        } catch (parseError) {
            throw new Error('Invalid JSON format. Please check your input.');
        }
        
        // Validate data field
        if (!inputData.hasOwnProperty('data')) {
            throw new Error('Input must have a "data" field');
        }
        
        if (!Array.isArray(inputData.data)) {
            throw new Error('The "data" field must be an array');
        }
        
        console.log('Sending to backend:', inputData);
        
        // Try to call backend API first
        let result;
        let usingBackend = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputData)
            });
            
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            result = await response.json();
            showConnectionStatus('✅ Using backend API', 'success');
            
        } catch (backendError) {
            console.log('Backend unavailable, using client-side processing:', backendError.message);
            
            // Fallback to client-side processing
            result = processArrayClientSide(inputData);
            usingBackend = false;
            showConnectionStatus('⚠️ Using client-side fallback', 'warning');
        }
        
        console.log('Result:', result);
        
        // Display result
        displayResult(result, usingBackend);
        hideErrorMessage();
        
    } catch (error) {
        console.error('Processing error:', error);
        showErrorMessage(error.message);
        outputContainer.innerHTML = `
            <div class="error-message">
                <h4>❌ Error</h4>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        // Reset button state
        showLoadingState(false);
        if (processBtn) {
            processBtn.disabled = false;
            processBtn.textContent = 'Process Array';
        }
    }
}

// Client-side processing (fallback when backend is unavailable)
function processArrayClientSide(inputData) {
    const data = inputData.data || [];
    const numbers = [];
    const alphabets = [];
    const specialChars = [];
    
    // Process each item in the array
    data.forEach(item => {
        const str = String(item).trim();
        
        // Check if it's a number (including multi-digit)
        if (/^\d+$/.test(str)) {
            numbers.push(parseInt(str));
        } 
        // Check if it's a single alphabet character
        else if (/^[a-zA-Z]$/.test(str)) {
            alphabets.push(str);
        } 
        // Everything else is a special character
        else if (str.length > 0) {
            specialChars.push(str);
        }
    });
    
    // Separate odd and even numbers
    const oddNumbers = numbers.filter(n => n % 2 !== 0).map(String);
    const evenNumbers = numbers.filter(n => n % 2 === 0).map(String);
    
    // Calculate sum of all numbers
    const sum = numbers.reduce((acc, curr) => acc + curr, 0).toString();
    
    // Sort alphabets: uppercase first, then lowercase
    const sortedAlphabets = alphabets.sort((a, b) => {
        // Uppercase letters come first
        if (a === a.toUpperCase() && b === b.toLowerCase()) return -1;
        if (a === a.toLowerCase() && b === b.toUpperCase()) return 1;
        // Within same case, sort alphabetically
        return a.localeCompare(b);
    });
    
    // Create concatenated string from sorted alphabets
    const concatString = sortedAlphabets.join('');
    
    return {
        is_success: true,
        user_id: "demo_user_29082025",
        email: "demo@example.com",
        roll_number: "12345",
        odd_numbers: oddNumbers,
        even_numbers: evenNumbers,
        alphabets: sortedAlphabets,
        special_characters: specialChars,
        sum: sum,
        concat_string: concatString,
        processed_with: "client_side_fallback"
    };
}

// Display the processing result
function displayResult(result, usingBackend) {
    const outputContainer = document.getElementById('apiResponse');
    if (!outputContainer) return;
    
    const processingMethod = usingBackend ? '🖥️ Backend API' : '💻 Client-side Fallback';
    const timestamp = new Date().toLocaleTimeString();
    
    const resultHTML = `
        <div class="result-container">
            <div class="result-header">
                <h4>📊 Processing Result</h4>
                <div class="result-meta">
                    <span class="processing-method">${processingMethod}</span>
                    <span class="timestamp">${timestamp}</span>
                </div>
            </div>
            <div class="result-content">
                <pre class="json-output">${JSON.stringify(result, null, 2)}</pre>
            </div>
            <div class="result-summary">
                <div class="summary-item">
                    <strong>Status:</strong> ${result.is_success ? '✅ Success' : '❌ Failed'}
                </div>
                <div class="summary-item">
                    <strong>Numbers:</strong> ${(result.odd_numbers || []).length + (result.even_numbers || []).length} total
                    (${(result.odd_numbers || []).length} odd, ${(result.even_numbers || []).length} even)
                </div>
                <div class="summary-item">
                    <strong>Alphabets:</strong> ${(result.alphabets || []).length}
                </div>
                <div class="summary-item">
                    <strong>Special Characters:</strong> ${(result.special_characters || []).length}
                </div>
                <div class="summary-item">
                    <strong>Sum:</strong> ${result.sum || '0'}
                </div>
            </div>
        </div>
    `;
    
    outputContainer.innerHTML = resultHTML;
}

// Show loading state
function showLoadingState(isLoading) {
    const outputContainer = document.getElementById('apiResponse');
    if (!outputContainer) return;
    
    if (isLoading) {
        outputContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Processing array data...</p>
            </div>
        `;
    }
}

// Show error message
function showErrorMessage(message) {
    const errorContainer = document.getElementById('errorMessage');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.className = 'error-message show';
    }
}

// Hide error message
function hideErrorMessage() {
    const errorContainer = document.getElementById('errorMessage');
    if (errorContainer) {
        errorContainer.style.display = 'none';
        errorContainer.className = 'error-message';
    }
}

// Additional utility functions
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!');
        });
    }
}

function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
