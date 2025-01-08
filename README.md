# Flavor Tale Server

This is the backend server for [Flavor Tale](https://flavor-tale.web.app/), a food ordering and management platform that allows users to explore, add, and purchase various food items. The server is built using **Node.js**, **Express.js**, and **MongoDB**, with JWT-based authentication and cookie handling for secure access.

---

## Features

### 1. **Authentication**
- **JWT-based authentication** with cookies for secure login and session management.
- Routes for user login (`/jwt`) and logout (`/logout`).

### 2. **Food Management**
- **Get all food items** with optional search (`/foods`).
- **Add new food items** (`POST /foods`).
- **Get food items by user email** (`/foods/email` - protected route).
- **Get single food item by ID** (`/foods/:id`).
- **Update food items** by ID (`PUT /foods/:id`).

### 3. **Purchase Management**
- **Create new purchases** (`POST /purchases`).
- **Fetch all purchases by email** (`/purchases/email` - protected route).
- **Delete a purchase** by ID (`DELETE /purchases/:id`).

---

## Technologies Used

- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Web framework for building the RESTful API.
- **MongoDB**: NoSQL database for storing food items and purchases.
- **JWT (JSON Web Token)**: For secure user authentication.
- **dotenv**: To manage environment variables.
- **cors**: To handle Cross-Origin Resource Sharing.
- **cookie-parser**: For parsing cookies.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jiadalfahmid/flavor-tale-server.git
   cd flavor-tale-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```bash
   PORT=5000
   DB_USER=your_db_user
   DB_PASS=your_db_password
   ACCESS_TOKEN_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Run the server:
   ```bash
   npm start
   ```

---

## API Endpoints

### **Base URL**
```
http://localhost:5000/
```

### **Authentication**

| Method | Endpoint   | Description             |
|--------|------------|-------------------------|
| POST   | `/jwt`     | Generate JWT token      |
| POST   | `/logout`  | Clear authentication cookie |

### **Food Management**

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/foods`              | Get all food items                   |
| GET    | `/foods?search=query` | Search food items by name            |
| POST   | `/foods`              | Add a new food item                  |
| GET    | `/foods/email`        | Get food items added by a specific user (protected) |
| GET    | `/foods/:id`          | Get a single food item by ID         |
| PUT    | `/foods/:id`          | Update a food item by ID             |

### **Purchase Management**

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/purchases`          | Create a new purchase                |
| GET    | `/purchases/email`    | Get all purchases by a specific user (protected) |
| DELETE | `/purchases/:id`      | Delete a purchase by ID              |

---

## Middleware

### 1. **CORS Configuration**
CORS is enabled to allow requests from multiple origins, including:
- `http://localhost:5173`
- `https://flavor-tale.netlify.app`
- `https://flavor-tales.web.app`
- `https://flavor-tales.firebaseapp.com`

### 2. **JWT Verification**
The middleware `verifyToken` is used to protect certain routes by ensuring that only authenticated users can access them.

---

## Deployment

This server is deployed on **Vercel**. Visit the live site: [Flavor Tale](https://flavor-tale.vercel.app/)

---

## Contribution

Feel free to fork the repository and submit pull requests. Any contributions to improve this project are highly welcome!

---

## Contact

For any queries or suggestions, please contact:  
**Md. Jiad Al Fahmid**  
Email: [jiadalfahmid@gmail.com](mailto:jiadalfahmid@gmail.com)  

Let's learn and grow together! 🚀

---

Would you like to add anything else, such as deployment steps or more about the project structure?
