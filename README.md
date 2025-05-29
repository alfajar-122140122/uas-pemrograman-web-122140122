# Quran Memorization App

This is a web application for memorizing the Quran (Hafalan). It consists of a React-based frontend and a Python-based backend with Pyramid framework.

## Features

- User authentication (register, login)
- Browse Quran surahs and ayahs from the alquran.cloud API
- Create, read, update, and delete hafalan (memorization) records
- Set reminders for murajaah (revision)
- Track memorization progress
- Dashboard with statistics and upcoming reminders

## Project Structure

The project is divided into two main parts:

1. **Frontend**: React.js, Vite, Tailwind CSS, Material-UI
2. **Backend**: Python with Pyramid framework, SQLAlchemy, JWT authentication

## Setup Instructions

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Initialize the database:
   ```
   cd backend
   pip install -e .
   initialize_db development.ini
   ```

4. Run the backend server:
   ```
   pserve development.ini --reload
   ```

The backend server will be available at http://localhost:6543

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get authentication token

### Users
- `GET /api/v1/users`: Get all users (admin only)
- `GET /api/v1/users/{user_id}`: Get user details
- `PUT /api/v1/users/{user_id}`: Update user
- `DELETE /api/v1/users/{user_id}`: Delete user

### Hafalan (Memorization)
- `GET /api/v1/users/{user_id}/hafalan`: Get all hafalan records for a user
- `POST /api/v1/users/{user_id}/hafalan`: Create a new hafalan record
- `GET /api/v1/hafalan/{hafalan_id}`: Get hafalan details
- `PUT /api/v1/hafalan/{hafalan_id}`: Update hafalan
- `DELETE /api/v1/hafalan/{hafalan_id}`: Delete hafalan

### Reminders
- `GET /api/v1/users/{user_id}/reminders`: Get all reminders for a user
- `POST /api/v1/users/{user_id}/reminders`: Create a new reminder
- `GET /api/v1/reminders/{reminder_id}`: Get reminder details
- `PUT /api/v1/reminders/{reminder_id}`: Update reminder
- `DELETE /api/v1/reminders/{reminder_id}`: Delete reminder

## External APIs

This application uses the [alquran.cloud API](https://alquran.cloud/api) for retrieving Quran data.

## License

This project is licensed under the MIT License.