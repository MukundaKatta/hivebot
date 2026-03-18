import type { GoogleSheetsConfig } from "@/types";

// Google Sheets API helper using REST API directly
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

async function getAccessToken(): Promise<string> {
  // In production, use proper Google Auth library
  // This is a simplified version using service account JWT
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Google Sheets credentials not configured");
  }

  // For simplicity, we'll use the API key approach
  // In production, implement proper JWT token exchange
  return process.env.GOOGLE_API_KEY || "";
}

export async function readSheet(config: GoogleSheetsConfig): Promise<{
  success: boolean;
  data?: string[][];
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    const range = `${config.sheet_name}!${config.range}`;
    const url = `${SHEETS_API_BASE}/${config.spreadsheet_id}/values/${encodeURIComponent(range)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Google Sheets API error: ${error}` };
    }

    const result = await response.json();
    return { success: true, data: result.values || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function writeSheet(config: GoogleSheetsConfig): Promise<{
  success: boolean;
  updatedCells?: number;
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    const range = `${config.sheet_name}!${config.range}`;
    const url = `${SHEETS_API_BASE}/${config.spreadsheet_id}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values: config.data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Google Sheets API error: ${error}` };
    }

    const result = await response.json();
    return { success: true, updatedCells: result.updatedCells };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function appendToSheet(config: GoogleSheetsConfig): Promise<{
  success: boolean;
  updatedCells?: number;
  error?: string;
}> {
  try {
    const token = await getAccessToken();
    const range = `${config.sheet_name}!${config.range}`;
    const url = `${SHEETS_API_BASE}/${config.spreadsheet_id}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values: config.data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Google Sheets API error: ${error}` };
    }

    const result = await response.json();
    return { success: true, updatedCells: result.updates?.updatedCells };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function executeGoogleSheets(config: GoogleSheetsConfig) {
  switch (config.action) {
    case "read":
      return readSheet(config);
    case "write":
      return writeSheet(config);
    case "append":
      return appendToSheet(config);
    default:
      return { success: false, error: `Unknown action: ${config.action}` };
  }
}
