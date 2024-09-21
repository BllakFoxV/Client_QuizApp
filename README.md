# React Quiz Application

## Overview

This React application is a quiz platform with user authentication and an admin panel. It allows users to take quizzes, view their scores, and for administrators to manage users and questions.

## Features

- User authentication (login/register)
- Quiz-taking with multiple choice questions
- Score tracking and display
- Dark mode toggle
- Admin panel for user and question management
- Responsive design using Tailwind CSS

## Key Components

1. `App.jsx`: Main component handling routing and authentication
2. `LoginPage.jsx`: Handles user login
3. `RegisterPage.jsx`: Manages user registration
4. `Dashboard.jsx`: User dashboard displaying quiz options and last score
5. `QuizPage.jsx`: Implements the quiz-taking functionality
6. `AdminPanel.jsx`: Admin interface for managing users and questions
7. `UserManagement.jsx`: Component for user management in the admin panel
8. `QuestionManagement.jsx`: Component for question management in the admin panel

## Setup and Configuration

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## API Integration

The application uses axios for API calls. Ensure the backend API is set up and running at the URL specified in the `.env` file.

## Routing

React Router is used for navigation:
- `/login`: Login page
- `/register`: Registration page
- `/dashboard`: User dashboard
- `/quiz`: Quiz page
- `/admin`: Admin panel
- `/`: Redirects to dashboard

## State Management

- Local state management using React hooks
- Token-based authentication stored in localStorage

## Styling

- Tailwind CSS for responsive design
- Custom components for modals and notifications

## Admin Functionality

- User management: View, activate/deactivate, and delete users
- Question management: Add, edit, and delete quiz questions
- Dashboard with statistics

## Security Considerations

- JWT token-based authentication
- Protected routes for authenticated users and admins

## Error Handling

- Error messages displayed for failed API calls
- Loading states for asynchronous operations

## Future Enhancements

- Implement more advanced quiz features (timed quizzes, different question types)
- Add user profile management
- Implement global state management (e.g., Redux) for more complex state handling

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` folder to a web server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).