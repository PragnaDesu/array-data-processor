const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all origins
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Array processing function
function processArrayData(inputData) {
    try {
        const data = inputData.data || [];
        
        if (!Array.isArray(data)) {
            throw new Error('Input data must be an array');
        }

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
            concat_string: concatString
        };
    } catch (error) {
        return {
            is_success: false,
            error: error.message,
            user_id: "demo_user_29082025",
            email: "demo@example.com",
            roll_number: "12345",
            odd_numbers: [],
            even_numbers: [],
            alphabets: [],
            special_characters: [],
            sum: "0",
            concat_string: ""
        };
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Array Data Processor API',
        version: '1.0.0',
        endpoints: {
            'POST /process': 'Process array data',
            'GET /health': 'Health check',
            'GET /': 'API information'
        },
        example_usage: {
            endpoint: '/process',
            method: 'POST',
            body: {
                data: ["a", "1", "23", "$", "B"]
            }
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Main processing endpoint
app.post('/process', (req, res) => {
    try {
        console.log('Received request:', JSON.stringify(req.body, null, 2));
        
        const result = processArrayData(req.body);
        
        console.log('Sending response:', JSON.stringify(result, null, 2));
        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            is_success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Handle 404 for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        is_success: false,
        error: 'Route not found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        is_success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Array Data Processor API running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📝 API docs: http://localhost:${PORT}/`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});