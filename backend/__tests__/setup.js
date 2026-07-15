process.env.DB_HOST = "localhost";
process.env.DB_PORT = "3306";
process.env.DB_USER = "root";
process.env.DB_PASS = process.env.DB_PASSWORD || "";
process.env.DB_DATABASE = "studenthub_test";
process.env.SESSION_SECRET = "test-secret";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:30010";
