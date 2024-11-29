# Expense Tracker - Secure and Efficient Expense Management  

Expense Tracker is a robust application designed to help users manage their personal and shared expenses with ease and security. Integrated with **SuperTokens**, the app ensures seamless authentication and role-based access control for a highly secure and user-friendly experience.  

---

## Key Features  
- **Expense Tracking:** Log daily expenses with categorized entries for better financial visibility.  
- **Budget Management:** Set and manage budgets to track spending and stay within limits.  
- **Shared Expenses:** Collaborate with others to track shared expenses and manage group finances.  
- **Role-Based Access Control:**  
  - **Managers:** Create and update budgets.  
  - **Contributors:** Add or update individual expense entries under predefined budgets.  
- **Secure Authentication:**  
  - User login and registration powered by SuperTokens for enhanced security.  

---

## Tech Stack  
- **Frontend:** React for an intuitive.  
- **Backend:** Node.js for scalable server-side logic.  
- **Authentication:** SuperTokens for secure and efficient user authentication.  
- **Database:** MySQL.  

---

## SuperTokens Integration Highlights  
1. **Session Management:** Maintain secure sessions with SuperTokens' robust session handling.  
2. **Role-Based Routing:** Protect routes based on user roles (e.g., redirect admins to specific dashboards).  
3. **Secure APIs:** Use SuperTokens middleware to guard backend APIs against unauthorized access.
4. **Authentication:** Authenticating with Email/Password or Google.

---

## Getting Started  

### Prerequisites  
- Install Node.js and npm/yarn.  
- Set up a SuperTokens account for authentication integration.  

### Steps  

1. Clone the repository:  
   ```bash
   git clone https://github.com/PhuHuynhMS/Expense-Tracker
2. Navigate to the project directory:
   ```bash
   cd expense-tracker
3. Install dependencies:
   ```bash
   npm install
4. Configure environment variables:
   - Backend: Add SuperTokens keys and database credentials to .env file.
   - Frontend: Update API endpoint and SuperTokens app info in .env file.
5. Start the development server:
   - Backend:
   ```bash
    node server.js
  - Frontend:
    ```bash
    npm start
