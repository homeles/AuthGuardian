const cron = require("node-cron");
const { Octokit } = require("@octokit/rest");
const fs = require('fs');
require('dotenv').config();

// Initialize Octokit with your GitHub token from environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Read GitHub token from environment variable
});

// Function to list all credential authorizations in the organization
async function listCredentialAuthorizations() {
  try {
    const org = process.env.ORG_NAME; // Read organization name from environment variable

    // List all credential authorizations in the organization with pagination
    const credentialAuthorizations = await octokit.paginate('GET /orgs/{org}/credential-authorizations', {
      org: org,
    });

    // Prepare CSV content
    const csvHeader = 'Credential Type,Credential ID,Login,Authorized At,Last Accessed At,Expires At,Valid For (Days),Status\n';
    const csvContent = credentialAuthorizations.map(auth => {
      const authorizedAt = new Date(auth.credential_authorized_at);
      const accessedAt = new Date(auth.credential_accessed_at);
      const expiresAt = new Date(auth.authorized_credential_expires_at);
      const now = new Date();
      const diffTime = Math.abs(now - authorizedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      const status = expiresAt && expiresAt < now ? 'Expired' : 'Active';

      return `${auth.credential_type},${auth.credential_id},${auth.login},${auth.credential_authorized_at},${auth.credential_accessed_at},${auth.authorized_credential_expires_at},${diffDays},${status}`;
    }).join("\n");

    const csvData = csvHeader + csvContent;

    // Write CSV file
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${org}_credential_authorizations_${date}.csv`;
    fs.writeFileSync(filename, csvData);

    // Log the list of credential authorizations
    const authorizationsList = credentialAuthorizations.map(auth => {
      const authorizedAt = new Date(auth.credential_authorized_at);
      const accessedAt = new Date(auth.credential_accessed_at);
      const expiresAt = new Date(auth.authorized_credential_expires_at);
      const now = new Date();
      const diffTime = Math.abs(now - authorizedAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
      const status = expiresAt && expiresAt < now ? 'Expired' : 'Active';

      return `- ${auth.credential_type}: ${auth.credential_id} (Login: ${auth.login}, Authorized at: ${auth.credential_authorized_at}, Last Accessed at: ${auth.credential_accessed_at}, Expires at: ${auth.authorized_credential_expires_at}, Valid for: ${diffDays} days, Status: ${status})`;
    }).join("\n");
    console.log(`## Credential Authorizations\n${authorizationsList}`);
  } catch (error) {
    console.error("Error listing credential authorizations:", error);
  }

  // Calculate and log the next run time
  const nextRun = new Date();
  nextRun.setMinutes(nextRun.getMinutes() + 5);
  console.log(`Next run at: ${nextRun.toLocaleString()}`);
}

// Run the task immediately on startup
listCredentialAuthorizations();

// Schedule the task to run every 5 minutes
cron.schedule("*/5 * * * *", listCredentialAuthorizations);