const http = require('http');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test assertion helper
function assertEqual(actual, expected, testName) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        console.log(`✅ ${testName}`);
        testsPassed++;
    } else {
        console.log(`❌ ${testName}`);
        console.log(`   Expected: ${JSON.stringify(expected)}`);
        console.log(`   Actual:   ${JSON.stringify(actual)}`);
        testsFailed++;
    }
}

function assertTrue(condition, testName) {
    if (condition) {
        console.log(`✅ ${testName}`);
        testsPassed++;
    } else {
        console.log(`❌ ${testName}`);
        testsFailed++;
    }
}

// Test cases
async function runTests() {
    console.log('🧪 Starting API Tests...\n');

    try {
        // Test 1: Health check
        console.log('🏥 Testing health endpoint...');
        const healthResponse = await makeRequest('GET', '/health');
        assertTrue(healthResponse.status === 200, 'Health endpoint returns 200');
        assertTrue(healthResponse.data.status === 'OK', 'Health endpoint returns OK status');

        // Test 2: API info endpoint
        console.log('\n📝 Testing API info endpoint...');
        const infoResponse = await makeRequest('GET', '/');
        assertTrue(infoResponse.status === 200, 'API info endpoint returns 200');
        assertTrue(infoResponse.data.message === 'Array Data Processor API', 'API info returns correct message');

        // Test 3: Basic array processing
        console.log('\n🔢 Testing basic array processing...');
        const basicTest = {
            data: ["a", "1", "23", "$", "B"]
        };
        const basicResponse = await makeRequest('POST', '/process', basicTest);
        assertTrue(basicResponse.status === 200, 'Process endpoint returns 200');
        assertTrue(basicResponse.data.is_success === true, 'Process returns success');
        assertEqual(basicResponse.data.odd_numbers, ["1", "23"], 'Correct odd numbers');
        assertEqual(basicResponse.data.even_numbers, [], 'Correct even numbers');
        assertEqual(basicResponse.data.alphabets, ["B", "a"], 'Correct alphabets');
        assertEqual(basicResponse.data.special_characters, ["$"], 'Correct special characters');
        assertEqual(basicResponse.data.sum, "24", 'Correct sum');
        assertEqual(basicResponse.data.concat_string, "Ba", 'Correct concatenated string');

        // Test 4: Even numbers test
        console.log('\n🔢 Testing even numbers...');
        const evenTest = {
            data: ["2", "4", "z", "Z", "@", "6"]
        };
        const evenResponse = await makeRequest('POST', '/process', evenTest);
        assertEqual(evenResponse.data.odd_numbers, [], 'No odd numbers');
        assertEqual(evenResponse.data.even_numbers, ["2", "4", "6"], 'Correct even numbers');
        assertEqual(evenResponse.data.sum, "12", 'Correct sum for even numbers');

        // Test 5: Mixed alphabets test
        console.log('\n📝 Testing alphabet sorting...');
        const alphabetTest = {
            data: ["x", "5", "y", "11", "#", "3", "Z", "A"]
        };
        const alphabetResponse = await makeRequest('POST', '/process', alphabetTest);
        assertEqual(alphabetResponse.data.alphabets, ["A", "Z", "x", "y"], 'Correct alphabet sorting');
        assertEqual(alphabetResponse.data.concat_string, "AZxy", 'Correct concatenated string with sorting');

        // Test 6: Empty array test
        console.log('\n🗂️ Testing empty array...');
        const emptyTest = {
            data: []
        };
        const emptyResponse = await makeRequest('POST', '/process', emptyTest);
        assertTrue(emptyResponse.data.is_success === true, 'Empty array returns success');
        assertEqual(emptyResponse.data.odd_numbers, [], 'Empty odd numbers');
        assertEqual(emptyResponse.data.even_numbers, [], 'Empty even numbers');
        assertEqual(emptyResponse.data.alphabets, [], 'Empty alphabets');
        assertEqual(emptyResponse.data.special_characters, [], 'Empty special characters');
        assertEqual(emptyResponse.data.sum, "0", 'Zero sum for empty array');
        assertEqual(emptyResponse.data.concat_string, "", 'Empty concatenated string');

        // Test 7: Invalid input test
        console.log('\n❌ Testing invalid input...');
        const invalidTest = {
            data: "not an array"
        };
        const invalidResponse = await makeRequest('POST', '/process', invalidTest);
        assertTrue(invalidResponse.data.is_success === false, 'Invalid input returns failure');

        // Test 8: Missing data field
        console.log('\n❌ Testing missing data field...');
        const missingDataTest = {};
        const missingResponse = await makeRequest('POST', '/process', missingDataTest);
        assertTrue(missingResponse.data.is_success === true, 'Missing data field handled gracefully');
        assertEqual(missingResponse.data.sum, "0", 'Missing data returns zero sum');

        // Test 9: 404 for unknown routes
        console.log('\n🔍 Testing 404 for unknown routes...');
        const notFoundResponse = await makeRequest('GET', '/unknown-route');
        assertTrue(notFoundResponse.status === 404, 'Unknown route returns 404');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        testsFailed++;
    }

    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n🚨 Some tests failed!');
        process.exit(1);
    }
}

// Check if server is running before testing
async function checkServerHealth() {
    try {
        await makeRequest('GET', '/health');
        console.log('✅ Server is running, starting tests...\n');
        return true;
    } catch (error) {
        console.log('❌ Server is not running!');
        console.log('Please start the server with: npm start');
        console.log('Then run tests with: npm test\n');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Array Data Processor - API Tests\n');
    
    const serverRunning = await checkServerHealth();
    if (serverRunning) {
        await runTests();
    }
}

main();