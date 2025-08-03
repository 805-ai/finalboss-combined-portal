/*
 * Enhanced client-side logic for the IP Licensing Portal.
 *
 * This script provides the same functionality as the original MVP, with
 * additional support for generating license agreements via AI models.
 * Requests are persisted in localStorage so the admin dashboard can
 * display them.  When users submit the form on the main page, the
 * script attempts to obtain a license from a serverless function.  If
 * the AI call fails or no provider is configured, it falls back to a
 * static template.
 */

// Read saved license requests from localStorage.  Returns an array.
function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem('licenseRequests')) || [];
  } catch (err) {
    return [];
  }
}

// Persist license requests back to localStorage.
function saveRequests(requests) {
  localStorage.setItem('licenseRequests', JSON.stringify(requests));
}

// Generate a simple static license template.  This is used as a fallback
// when no AI provider is selected or an error occurs during the call.
function generateLicenseTextStatic(data) {
  const summary =
    'The licensed invention is a blockchain‑based dynamic consent management system for synthetic media. ' +
    'It uses smart contracts, hierarchical consent structures, zero‑knowledge proofs and decentralized oracles ' +
    'to ensure secure and flexible governance of synthetic media lifecycle.\n\n';
  return (
    `LICENSE AGREEMENT\n` +
    `Issued to: ${data.name} <${data.email}>\n` +
    `Duration: ${data.duration}\n` +
    `Intended use: ${data.use}\n\n` +
    `Summary of the invention:\n${summary}` +
    `Grant of Rights: The licensor hereby grants the licensee a non‑exclusive, non‑transferable license to use the ` +
    `invention described above for the stated intended use during the specified duration. All other rights are reserved.\n\n` +
    `By accepting this license you agree to abide by any additional terms and conditions set forth by the licensor.`
  );
}

// Call a serverless function to generate a license using an AI model.  The
// provider must be one of 'claude', 'gemini' or 'chatgpt'.  Returns the
// generated text on success or null on failure.
async function generateLicenseAI(data, provider) {
  const prompt =
    'Draft a formal licensing agreement based on the following details:\n' +
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Intended use: ${data.use}\n` +
    `Duration: ${data.duration}\n` +
    'The licensed invention is a blockchain‑based dynamic consent management system for synthetic media that uses smart contracts, hierarchical consent structures, zero‑knowledge proofs and decentralized oracles.\n' +
    'The agreement should summarise the invention, specify the grant of rights, and be clear and concise.';
  const endpoints = {
    claude: '/.netlify/functions/generate_license_claude',
    gemini: '/.netlify/functions/generate_license_gemini',
    chatgpt: '/.netlify/functions/generate_license_chatgpt',
  };
  const url = endpoints[provider];
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    return json.result || null;
  } catch (err) {
    return null;
  }
}

// Render the admin dashboard table of license requests.  Each request can
// be approved or rejected, which updates its status and re-renders.
function renderRequestsTable() {
  const table = document.getElementById('requests-table');
  if (!table) return;
  const requests = loadRequests();
  table.innerHTML = '';
  requests.forEach((req, idx) => {
    const row = document.createElement('tr');
    row.innerHTML =
      `<td>${req.name}</td>` +
      `<td>${req.email}</td>` +
      `<td>${req.use}</td>` +
      `<td>${req.duration}</td>` +
      `<td class="status ${req.status || 'pending'}">${req.status || 'pending'}</td>` +
      `<td>` +
      `<button class="approve">Approve</button> ` +
      `<button class="reject">Reject</button>` +
      `</td>`;
    // Attach event handlers for approve/reject actions
    row.querySelector('.approve').addEventListener('click', () => {
      req.status = 'approved';
      saveRequests(requests);
      renderRequestsTable();
    });
    row.querySelector('.reject').addEventListener('click', () => {
      req.status = 'rejected';
      saveRequests(requests);
      renderRequestsTable();
    });
    table.appendChild(row);
  });
}

// Initialise the appropriate page.  On the main page, set up the form
// handler.  On the admin page, render the requests table.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('license-form');
  const resultSection = document.getElementById('license-result');
  const licenseContent = document.getElementById('license-content');
  // Determine if this page contains the admin table
  if (document.getElementById('requests-table')) {
    renderRequestsTable();
    return;
  }
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const request = {
      name: formData.get('name')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      use: formData.get('use')?.trim() || '',
      duration: formData.get('duration') || '',
      accepted: formData.get('accept') === 'on',
    };
    if (!request.accepted) {
      alert('You must accept the license terms to proceed.');
      return;
    }
    // Persist the request for the admin dashboard
    const requests = loadRequests();
    requests.push({ ...request, status: 'pending' });
    saveRequests(requests);
    // Attempt to generate the license via Claude.  Other providers could be
    // selected by changing the provider name below (e.g. 'gemini' or 'chatgpt').
    let licenseText = await generateLicenseAI(request, 'claude');
    // Fall back to the static template if the AI call fails
    if (!licenseText) {
      licenseText = generateLicenseTextStatic(request);
    }
    if (licenseContent) {
      licenseContent.textContent = licenseText;
    }
    if (resultSection) {
      resultSection.style.display = 'block';
    }
    form.reset();
  });
});
