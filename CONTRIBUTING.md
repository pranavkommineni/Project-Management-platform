# Contributing to DevChart

Thank you for your interest in contributing to DevChart! We welcome contributions that improve functionality, performance, documentation, and user experience.

## Getting Started

### 1. Fork the Repository

Create your own fork of the repository and clone it locally:

```bash
git clone https://github.com/pranavkommineni/Project-Management-platform.git
cd dev-chart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

# Development Guidelines

## Code Style

* Use meaningful variable and function names.
* Keep components small and reusable.
* Write clean and readable code.
* Remove unused imports and variables.
* Follow existing project structure and naming conventions.

## Frontend Contributions

When modifying UI components:

* Maintain responsive design.
* Ensure accessibility where possible.
* Avoid breaking existing functionality.
* Keep styling consistent throughout the application.

## Backend Contributions

When working on API routes or database models:

* Validate incoming data.
* Handle errors appropriately.
* Avoid breaking existing API contracts.
* Test database operations before submitting changes.

---

# Branch Naming Convention

Use descriptive branch names:

```text
feature/add-task-filtering
feature/dark-mode

bugfix/fix-task-modal
bugfix/activity-log-error

docs/update-readme
```

---

# Commit Message Guidelines

Use clear and concise commit messages:

```text
feat: add task priority filtering

fix: resolve kanban drag-and-drop issue

docs: update installation instructions

refactor: improve database connection handling
```

---

# Pull Request Process

1. Create a new branch from `main`.
2. Implement your changes.
3. Test all affected functionality.
4. Commit your changes.
5. Push the branch to your fork.
6. Open a Pull Request.

### Pull Request Checklist

* [ ] Code builds successfully
* [ ] No console errors or warnings
* [ ] Existing functionality remains intact
* [ ] New features are documented
* [ ] Code follows project standards

---

# Reporting Issues

When reporting issues, include:

* Description of the problem
* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots (if applicable)
* Browser and operating system information

---

# Feature Requests

Feature suggestions are welcome. Please provide:

* Problem statement
* Proposed solution
* Expected benefits
* Any implementation ideas

---

# Security

If you discover a security vulnerability, please report it responsibly rather than disclosing it publicly.

Do not commit:

* API keys
* Database credentials
* Environment files
* Authentication secrets

---

# Code of Conduct

Please be respectful and constructive when interacting with other contributors.

We aim to maintain a welcoming, inclusive, and collaborative environment for everyone.

---

# Thank You

Your contributions help improve DevChart and make the project more useful for the community. We appreciate your time, effort, and support.
