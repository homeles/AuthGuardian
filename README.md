# AuthGuardian

This is a JavaScript application that controls the Token and SSH Key authorizations for a GitHub Organization. It lists all credential authorizations in the organization every hour.

## Prerequisites

- Node.js installed on your machine
- A GitHub personal access token with the necessary permissions
- The name of the GitHub organization you want to monitor

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/homeles/AuthGuardian
   cd AuthGuardian
    ```

2. Install the required packages:
   ```sh
   npm install
   ```

3. Create a .env file in the root directory of the project and add the following environment variables
    ```sh
    GITHUB_TOKEN=your-github-token
    ORG_NAME=your-org-name
    ```

## Running the Application
To run the application, use the following command:

```sh
node index.js
```

The application will list all credential authorizations in the organization immediately on startup and then every hour.

## License
This project is licensed under the MIT License.

