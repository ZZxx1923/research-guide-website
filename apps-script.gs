// ============================================
// Google Apps Script - Backend for Excuses Management
// ============================================

// Google Sheet Configuration
const SHEET_ID = "1qK29NCrGAFiPaqyab0ytyk8trUoBc66oNMUVShzy4z0";
const PASSWORD = "Emdad@2025";

// Get the spreadsheet
function getSheet() {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    return spreadsheet.getSheetByName("Data") || spreadsheet.getSheets()[0];
}

// ============================================
// Helper Functions
// ============================================

function findRowByType(type) {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 0; i < data.length; i++) {
        if (data[i][0] === type) {
            return i + 1; // Google Sheets is 1-indexed
        }
    }
    return null;
}

function getDataByType(type) {
    const sheet = getSheet();
    const row = findRowByType(type);
    
    if (row) {
        const value = sheet.getRange(row, 2).getValue();
        try {
            return JSON.parse(value);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function saveDataByType(type, data) {
    const sheet = getSheet();
    let row = findRowByType(type);
    
    if (!row) {
        // Add new row if type doesn't exist
        sheet.appendRow([type, JSON.stringify(data)]);
    } else {
        // Update existing row
        sheet.getRange(row, 2).setValue(JSON.stringify(data));
    }
}

// ============================================
// Excuses Management Functions
// ============================================

function doGet(e) {
    return HtmlService.createHtmlOutput("API is running");
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        const password = data.password;
        
        // Verify password for write operations
        if (action !== "getExcuses" && action !== "getPdfs" && password !== PASSWORD) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: "Invalid password"
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
        let result = {};
        
        switch (action) {
            case "getExcuses":
                result = { success: true, data: getDataByType("excuses") };
                break;
            
            case "getPdfs":
                result = { success: true, data: getDataByType("pdfs") };
                break;
            
            case "addExcuse":
                const excuses = getDataByType("excuses");
                const newExcuse = {
                    id: Date.now().toString(),
                    text: data.text
                };
                excuses.push(newExcuse);
                saveDataByType("excuses", excuses);
                result = { success: true, data: newExcuse };
                break;
            
            case "updateExcuse":
                const excuses2 = getDataByType("excuses");
                const excuse = excuses2.find(e => e.id === data.id);
                if (excuse) {
                    excuse.text = data.text;
                    saveDataByType("excuses", excuses2);
                    result = { success: true, data: excuse };
                } else {
                    result = { success: false, error: "Excuse not found" };
                }
                break;
            
            case "deleteExcuse":
                const excuses3 = getDataByType("excuses");
                const filtered = excuses3.filter(e => e.id !== data.id);
                saveDataByType("excuses", filtered);
                result = { success: true };
                break;
            
            case "addPdf":
                const pdfs = getDataByType("pdfs");
                const newPdf = {
                    id: Date.now().toString(),
                    name: data.name,
                    url: data.url
                };
                pdfs.push(newPdf);
                saveDataByType("pdfs", pdfs);
                result = { success: true, data: newPdf };
                break;
            
            case "updatePdf":
                const pdfs2 = getDataByType("pdfs");
                const pdf = pdfs2.find(p => p.id === data.id);
                if (pdf) {
                    pdf.name = data.name;
                    pdf.url = data.url;
                    saveDataByType("pdfs", pdfs2);
                    result = { success: true, data: pdf };
                } else {
                    result = { success: false, error: "PDF not found" };
                }
                break;
            
            case "deletePdf":
                const pdfs3 = getDataByType("pdfs");
                const filtered2 = pdfs3.filter(p => p.id !== data.id);
                saveDataByType("pdfs", filtered2);
                result = { success: true };
                break;
            
            default:
                result = { success: false, error: "Unknown action" };
        }
        
        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// Deployment Instructions
// ============================================
/*
1. Go to Google Apps Script (script.google.com)
2. Create a new project
3. Replace the default code with this script
4. Save the project
5. Click "Deploy" > "New deployment"
6. Select "Web app" as the type
7. Set "Execute as" to your Google account
8. Set "Who has access" to "Anyone"
9. Click "Deploy"
10. Copy the deployment URL (it will be in the format: https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercontent)
11. Update the GOOGLE_APPS_SCRIPT_URL in the frontend script.js with this URL
*/

