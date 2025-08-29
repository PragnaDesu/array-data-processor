# Array Data Processor - Backend API

A Node.js Express backend that processes array inputs and returns categorized results.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone/Download the project**
   ```bash
   # If using git
   git clone <your-repo-url>
   cd array-data-processor-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-restart)
   npm run dev
   ```

4. **Server will be running at:**
   - **Local:** http://localhost:3001
   - **Health Check:** http://localhost:3001/health
   - **API Docs:** http://localhost:3001/

## 📡 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### `GET /`
Returns API information and usage examples.

#### `GET /health`
Health check endpoint that returns server status.

#### `POST /process`
Main endpoint that processes array data.

**Request Body:**
```json
{
  "data": ["a", "1", "23", "$", "B"]
}
```

**Response:**
```json
{
  "is_success": true,
  "user_id": "demo_user_29082025",
  "email": "demo@example.com",
  "roll_number": "12345",
  "odd_numbers": ["1", "23"],
  "even_numbers": [],
  "alphabets": ["B", "a"],
  "special_characters": ["$"],
  "sum": "24",
  "concat_string": "Ba"
}
```

## 🧪 Testing the API

### Using curl
```bash
# Test the main endpoint
curl -X POST http://localhost:3001/process \
  -H "Content-Type: application/json" \
  -d '{"data": ["a", "1", "23", "$", "B"]}'

# Health check
curl http://localhost:3001/health
```

### Using Postman
1. Set method to **POST**
2. URL: `http://localhost:3001/process`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON with your data array

## 🔧 Processing Logic

The API processes input arrays with the following logic:

1. **Numbers**: Separated into odd and even categories
2. **Alphabets**: Single alphabetic characters (a-z, A-Z)
3. **Special Characters**: Everything else (symbols, punctuation, etc.)
4. **Sum**: Total of all numeric values
5. **Concatenated String**: Alphabets sorted (uppercase first, then lowercase)

## 📁 Project Structure

```
array-data-processor-backend/
├── package.json          # Dependencies and scripts
├── server.js             # Main Express server
├── test.js               # Test cases
├── README.md             # This file
└── .env                  # Environment variables (create if needed)
```

## ⚙️ Environment Variables

Create a `.env` file for custom configuration:

```env
PORT=3001
NODE_ENV=development
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin requests enabled
- **Input validation**: JSON parsing with size limits
- **Error handling**: Graceful error responses

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Railway
1. Connect your GitHub repo to Railway
2. Set environment variables
3. Deploy automatically

### Heroku
1. Create Heroku app: `heroku create your-app-name`
2. Deploy: `git push heroku main`

## 📊 Example Requests

### Basic Example
```json
{
  "data": ["a", "1", "2", "b", "B", "$", "3"]
}
```

### Complex Example
```json
{
  "data": ["x", "5", "y", "11", "#", "3", "Z", "8", "@"]
}
```

### Empty Array
```json
{
  "data": []
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### CORS Issues
The server has CORS enabled for all origins. If you still face issues, check your browser's developer console.

## 📝 License

MIT License - feel free to use this project for learning and development.