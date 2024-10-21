# Daily-Expenses-Sharing-Application

Daily Expenses Sharing Application
This project is a backend service that allows users to split expenses among participants using different methods (equal, exact, or percentage). It tracks expenses, balance sheets, and debt payments between users.

**Features**
User Management: Create and manage users.
Expense Management: Add expenses with different split methods (equal, exact, percentage).
Balance Sheet: Generate a downloadable balance sheet as a CSV file.
Debt Payment: Pay off debts between users, automatically updating the balance sheet.

**Setup Instructions**
Prerequisites
Ensure you have the following installed:
Node.jsa
MongoDB (MongoDB Atlas)
Installation
Clone the repository:
```git clone https://github.com/zaidk2021/daily-expenses-sharing-app.git```
Navigate to the project directory:

```cd daily-expenses-sharing-app```
Install the dependencies:

```npm install```
Set up environment variables:

Create a .env file in the root directory:
```
MONGO_URI=mongodb://localhost:27017/daily-expenses
PORT=3000
```
Start the MongoDB server:
```mongod```
Start the Node.js server:
```npm start```
The app will be running on http://localhost:3000.

**API Documentation**

**1. User Management**
**Create a New User**
Method: POST

Endpoint: /users

Request Body:

json
```
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890"
}
```
Response:

json
```
{
  "_id": "60d2c6d0f2348a2f1d1e6d13",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "createdAt": "2023-01-01T12:34:56.789Z",
  "updatedAt": "2023-01-01T12:34:56.789Z"
}
```
**Get User Details**
Method: GET

Endpoint: /users/:id

Description: Fetch details of a specific user by their ID.

Example: GET /users/60d2c6d0f2348a2f1d1e6d13

Response:

json
```
{
  "_id": "60d2c6d0f2348a2f1d1e6d13",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890"
}
```
**2. Expense Management**
**Create a New Expense**
Method: POST

Endpoint: /expenses

Description: Create a new expense.

Request Body (Example with percentage split):

json
```
{
  "amount": 5000,
  "method": "percentage",
  "userId": "60d2c6d0f2348a2f1d1e6d13",
  "participants": [
    { "userId": "60d2c6d0f2348a2f1d1e6d13", "share": 60 },
    { "userId": "60d2c6d0f2348a2f1d1e6d14", "share": 40 }
  ]
}
```
Response:

json
```
{
  "_id": "60d2c6d0f2348a2f1d1e6d15",
  "amount": 5000,
  "method": "percentage",
  "userId": "60d2c6d0f2348a2f1d1e6d13",
  "participants": [
    { "userId": "60d2c6d0f2348a2f1d1e6d13", "share": 60 },
    { "userId": "60d2c6d0f2348a2f1d1e6d14", "share": 40 }
  ],
  "createdAt": "2023-01-01T12:34:56.789Z",
  "updatedAt": "2023-01-01T12:34:56.789Z"
}
```
**Get All Expenses for a User**
Method: GET

Endpoint: /expenses/user/:userId

Description: Retrieve all expenses where the user is either a payer or a participant.

Example: GET /expenses/user/60d2c6d0f2348a2f1d1e6d13

Response:

json
```
[
  {
    "_id": "60d2c6d0f2348a2f1d1e6d15",
    "amount": 5000,
    "method": "percentage",
    "userId": "60d2c6d0f2348a2f1d1e6d13",
    "participants": [
      { "userId": "60d2c6d0f2348a2f1d1e6d13", "share": 60 },
      { "userId": "60d2c6d0f2348a2f1d1e6d14", "share": 40 }
    ]
  }
]
```
**3. Balance Sheet**
**Get the Balance Sheet**
Method: GET

Endpoint: /expenses/balancesheet

Description: Generate the balance sheet for all users, detailing how much each user owes and how much they have paid.

Response:

json
```
{
  "John Doe": {
    "totalPaid": 5000,
    "totalOwed": 3000
  },
  "Jane Doe": {
    "totalPaid": 0,
    "totalOwed": 2000
  }
}
```
**Download Balance Sheet as CSV**
Method: GET
Endpoint: /expenses/balancesheet/download
Description: Download the balance sheet as a CSV file.

**4. Debt Payment**
**Pay Off a Debt**
Method: POST

Endpoint: /expenses/pay

Description: Pay off debt between users.

Request Body:

json
```
{
  "payerId": "60d2c6d0f2348a2f1d1e6d13",
  "payeeId": "60d2c6d0f2348a2f1d1e6d14",
  "amount": 1000
}
```
Response:

json
```
{
  "message": "Debt paid successfully"
}
```
