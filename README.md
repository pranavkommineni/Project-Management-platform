

# DevChart – Project Management Platform

A modern, full-stack project management platform built with **Next.js**, **MongoDB**, and **Mongoose**. DevChart helps teams organize tasks, track project progress, manage workflows, and collaborate efficiently through an intuitive Kanban-style interface.This platform is for the task management done by clubs.This can also be used to noted the taks.

---

## Features

### Task Management

* Create, update, and delete tasks
* Assign priorities and due dates
* Track task progress
* Detailed task descriptions
* Real-time task status updates

### Kanban Board

* Drag-and-drop workflow management
* Organize tasks by stages
* Visual project tracking
* Dynamic task movement across columns

### Project Organization

* Centralized project management
* Structured task categorization
* Activity tracking and monitoring
* Efficient workflow management

### Activity Monitoring

* Track project activities
* Monitor task updates
* View workflow history
* Team productivity insights

### Backend Integration

* MongoDB database support
* RESTful API architecture
* Secure data storage
* Optimized database operations with Mongoose

---

## Tech Stack

### Frontend

* **Next.js 14**
* **React 18**
* **JavaScript**
* **CSS**

### Backend

* **Next.js API Routes**
* **Node.js Runtime**
* **MongoDB**
* **Mongoose ODM**

### Deployment

* **Vercel**
* **MongoDB Atlas**

---

## 📂 Project Structure

```bash
dev-chart/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── board/
│   │   ├── page.js
│   │   └── layout.js
│   │
│   ├── components/
│   │   ├── KanbanBoard.js
│   │   ├── TaskCard.js
│   │   ├── TaskModal.js
│   │   ├── Navbar.js
│   │   └── ActivityFeed.js
│   │
│   └── lib/
│       ├── mongodb.js
│       ├── models/
│       └── utilities/
│
├── public/
├── package.json
├── next.config.js
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/dev-chart.git
cd dev-chart
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Deployment

### Deploy on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variable:

```env
MONGODB_URI=your_mongodb_connection_string
```

4. Deploy the application.

---

## API Capabilities

### Tasks API

* Create tasks
* Update task details
* Delete tasks
* Fetch all tasks
* Filter and manage task status

### Activity API

* Store activity logs
* Track project events
* Monitor task operations

---

## Core Functionalities

✅ Task Creation

✅ Task Editing

✅ Task Deletion

✅ Kanban Workflow Management

✅ MongoDB Data Persistence

✅ Activity Tracking

✅ Responsive User Interface

✅ Next.js App Router Architecture

---

## Future Enhancements

* User Authentication
* Team Collaboration Features
* Role-Based Access Control
* Notifications & Alerts
* File Attachments
* Dashboard Analytics
* Real-Time Updates with WebSockets
* Dark Mode Support

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Pranav Kommineni**

