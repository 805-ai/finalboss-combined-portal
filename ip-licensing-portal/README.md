# IP Licensing Portal

This project provides a minimal prototype for managing intellectual property (IP) licensing. It allows potential licensees to request access to your patented technology and gives the patent owner a simple dashboard to review and manage those requests.

## Features

- **Patent summary:** A concise overview of the blockchain‑based dynamic consent management system for synthetic media lifecycle governance.
- **License request form:** Collects basic information (name, email, intended use, duration) and requires acceptance of terms. Submissions are stored locally and displayed back as a draft license agreement.
- **License generation:** Generates a simple license text incorporating user‑provided information and a summary of the invention. The draft license is displayed to the requester for review.
- **Admin dashboard:** Accessible via `admin.html`, this dashboard lists all submitted requests, shows their status (Pending/Approved/Rejected) and allows the patent holder to approve or reject each request. State is persisted in the browser’s local storage.
- **Static deployment:** No server is required. The site is completely client‑side and can be deployed to Netlify or any static hosting provider. The `netlify.toml` file instructs Netlify to serve the site from the project root.

## Getting started

1. **Local preview:** Open `index.html` in your web browser to view the portal and submit a test license request. Navigate to `admin.html` to see the admin dashboard.
2. **Customization:** Edit the HTML, CSS and JavaScript files to match your branding, change the license template, or add additional fields.
3. **Deploy:** Zip the contents of this folder (or push it to a Git repository) and connect it to Netlify for continuous deployment. The repository root should be set as the publish directory.

## Disclaimer

This prototype is meant for demonstration purposes only. It stores data in the browser’s local storage and is not suitable for production use without server‑side persistence and security enhancements. You should also consult with a legal professional to draft enforceable license agreements.
