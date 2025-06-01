# 🌍 Climate Solutions App

A full-stack web application that empowers individuals and communities to **create**, **share**, and **collaborate** on climate solution projects. Built as part of the WEB322 course, this platform emphasizes sustainability, accountability, and community-driven action.

## ✨ Features

- 🌱 **Collaborative Projects** – Users can create, update, and manage climate action initiatives.
- 🔐 **Secure Authentication** – Robust user login system with session tracking.
- 🕓 **Login History** – Displays the last 8 login timestamps along with client device and browser info.
- 💾 **Persistent Storage** – Uses PostgreSQL and MongoDB to store user data and project details.
- 🎨 **Responsive UI** – Built with Tailwind CSS for a clean, modern, and mobile-friendly experience.

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, Tailwind CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Databases**: PostgreSQL (user and project data), MongoDB (login history)
- **Authentication**: Sessions and secure password hashing

## 🚀 Getting Started

To run the app locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/climate-solutions-app.git
   cd climate-solutions-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following:
   ```
   PORT=3000
   SESSION_SECRET=yourSecretKey
   POSTGRES_URI=yourPostgresConnectionString
   MONGODB_URI=yourMongoConnectionString
   ```

4. **Run the app**
   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:3000`


## 📚 Learning Outcomes

This project was built as part of the [WEB322: Web Development](https://web322.ca/) course and focused on:
- Full-stack application architecture
- RESTful routing and middleware design
- Secure user management with sessions
- Database integration using both SQL and NoSQL systems
