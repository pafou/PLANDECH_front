# Plan de Charge Frontend

## Overview

This is the frontend application for the Plan de Charge system, built with React. The application provides a user interface for managing work plans, teams, subjects, and administrative tasks.

## Features

- User authentication and authorization
- Admin dashboard for managing:
  - Admins
  - Teams and team members
  - Subjects and subject types
  - Color coding for subject types
- User selection interface
- Modification interface for work plans

## Project Structure

```
front/
├── public/                # Static files
├── src/                   # Source code
│   ├── apiConfig.ts       # API configuration
│   ├── App.tsx            # Main application component
│   ├── components/        # React components
│   │   ├── Admin.tsx      # Admin dashboard
│   │   ├── Modif.tsx      # Modification interface
│   │   ├── UserSelect.tsx # User selection component
│   │   └── ...            # Other components
│   ├── utils/             # Utility functions
│   └── ...                # Other files
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects the Create React App configuration (use with caution)

## API Configuration

The frontend communicates with a backend API. The API base URL is configured in `src/apiConfig.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:5001';
```

You may need to update this URL to match your backend server.

## Environment Variables

The application uses the following environment variables:

- `REACT_APP_API_URL`: The base URL for the API (default: `http://localhost:5001`)

## Components

### Admin Dashboard

The admin dashboard provides interfaces for managing various aspects of the system:

- **Manage Admins**: Add/remove admin users
- **Manage Teams**: Create and manage teams
- **Manage Team Members**: Assign team members to teams
- **Manage Subjects**: Create and manage work subjects
- **Manage Subject Types**: Define different types of work subjects
- **Manage Colors**: Assign colors to subject types for visualization

### User Interface

- **UserSelect**: Component for selecting users
- **Modif**: Interface for modifying work plans

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- Uses [React Router](https://reactrouter.com/) for navigation
- TypeScript for static type checking
