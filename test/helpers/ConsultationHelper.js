// test/helpers/ConsultationHelper.js

import { login } from './AuthHelper.js';

/**
 * ============================================================
 *  CONSULTATION HELPER
 *  Covers three consultation workflows:
 *    1. Requests        → processConsultationRequest()
 *    2. Pending         → viewPendingConsultation() / listPendingConsultations()
 *    3. Appointments    → viewConsultationAppointment() / listConsultationAppointments()
 *
 *  Shared utilities (navigation, modals, notes, diagnosis, admit)
 *  are defined once and reused across all three flows.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// SECTION 1 — SHARED UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Open the Consultation parent submenu in the sidebar.
 * Tries both the "active" and "open" class variants seen across recordings.
 */
async function openConsultationSubmenu() {
  console.log('Opening Consultation submenu...');

  const submenuSelectors = [
    'li.ant-menu-submenu-active > div > span', // Pending.json step 3
    'li.ant-menu-submenu-open > div > span', // Request.json step 3
    '//span[contains(text(),"Consultation")]',
    '//span[contains(text(),"Patient Management")]',
  ];

  for (const selector of submenuSelectors) {
    try {
      const items = await $$(selector);
      if (items.length > 0) {
        await items[0].click();
        await browser.pause(1000);
        console.log(`✔ Consultation submenu opened using: ${selector}`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  console.log('⚠ Submenu may already be open — continuing');
  return false;
}

/**
 * Click a named menu link inside the Consultation submenu.
 * @param {string} linkText - e.g. 'Requests', 'Pending Consultation', 'Appointments'
 */
async function clickConsultationMenuLink(linkText) {
  console.log(`Clicking Consultation menu link: "${linkText}"...`);

  const selectors = [
    `=${linkText}`,
    `//a[normalize-space(.)="${linkText}"]`,
    `//span[normalize-space(.)="${linkText}"]`,
    'li.ant-menu-item-active a',
  ];

  for (const selector of selectors) {
    try {
      const items = await $$(selector);
      if (items.length > 0) {
        await items[0].click();
        await browser.pause(2000);
        console.log(`✔ "${linkText}" menu link clicked using: ${selector}`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  throw new Error(`Consultation menu link "${linkText}" not found`);
}

/**
 * Full navigation: login → open submenu → click named link.
 * @param {string} linkText - Menu item label
 */
async function navigateToConsultationPage(linkText) {
  await login();
  await openConsultationSubmenu();
  await browser.pause(500);
  await clickConsultationMenuLink(linkText);
}

/**
 * Click an action button inside a specific table row.
 * Mirrors the recorded selectors from both Request.json and Pending.json.
 *
 * @param {number} rowIndex    - 1-based row index (nth-of-type from recording)
 * @param {number} actionIndex - Which action div/button in the row (1-based)
 */
async function clickRowAction(rowIndex, actionIndex) {
  console.log(`Clicking action ${actionIndex} on row ${rowIndex}...`);

  const selectors = [
    `tr:nth-of-type(${rowIndex}) div:nth-of-type(${actionIndex}) span`,
    `tr:nth-of-type(${rowIndex}) div:nth-of-type(${actionIndex}) button`,
    `tr.orange-row div:nth-of-type(${actionIndex}) span`, // Request.json orange rows
    `table tbody tr:nth-child(${rowIndex}) td:last-child div:nth-of-type(${actionIndex}) button span`,
  ];

  for (const selector of selectors) {
    try {
      const elements = await $$(selector);
      if (elements.length > 0) {
        await elements[0].click();
        await browser.pause(1500);
        console.log(`✔ Row action clicked using: ${selector}`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  // Fallback: locate by row position in filtered table rows
  try {
    const rows = await $$('table tbody tr:not(.ant-table-measure-row)');
    const targetRow = rows[rowIndex - 1];
    if (targetRow) {
      const actionBtns = await targetRow.$$('button');
      if (actionBtns.length >= actionIndex) {
        await actionBtns[actionIndex - 1].click();
        await browser.pause(1500);
        console.log(`✔ Fallback: clicked button ${actionIndex} in row ${rowIndex}`);
        return true;
      }
    }
  } catch (err) {
    console.log(`⚠ Fallback row action failed: ${err.message}`);
  }

  throw new Error(`Row action (row=${rowIndex}, action=${actionIndex}) not found`);
}

/**
 * Get all data rows from the current consultation table.
 */
async function getTableRows() {
  try {
    const rows = await $$('table tbody tr:not(.ant-table-measure-row)');
    console.log(`✔ Found ${rows.length} table rows`);
    return rows;
  } catch (error) {
    console.error('Failed to get table rows:', error.message);
    return [];
  }
}

/**
 * Close an open modal or drawer.
 * Covers the close-X button pattern seen in Pending.json step 8.
 */
async function closeModal() {
  console.log('Closing modal/drawer...');

  const closeSelectors = [
    'aria/close',
    '.ant-modal-close',
    '.ant-drawer-close',
    'button[aria-label="close"]',
    'button[aria-label="Close"]',
    '//button[contains(@class,"ant-modal-close")]',
    '//button[contains(@class,"ant-drawer-close")]',
    'body > div:nth-of-type(2) div:nth-of-type(1) > div > button',
  ];

  for (const selector of closeSelectors) {
    try {
      const btns = await $$(selector);
      if (btns.length > 0) {
        const isVisible = await btns[0].isDisplayed().catch(() => false);
        if (isVisible) {
          await btns[0].click();
          await browser.pause(1000);
          console.log(`✔ Modal closed using: ${selector}`);
          return true;
        }
      }
    } catch (err) {
      // try next
    }
  }

  console.log('⚠ No open modal found to close');
  return false;
}

/**
 * Dismiss the "Got It" confirmation modal if it appears.
 * Seen in Request.json step 7.
 */
async function dismissGotItModal() {
  console.log('Checking for Got It modal...');

  try {
    await browser.pause(1000);

    const gotItSelectors = [
      'text/Got It',
      'div.ant-modal-confirm-btns span',
      '//button[contains(.,"Got It")]',
      'button*=Got It',
    ];

    for (const selector of gotItSelectors) {
      try {
        const btns = await $$(selector);
        if (btns.length > 0) {
          const isVisible = await btns[0].isDisplayed().catch(() => false);
          if (isVisible) {
            await btns[0].click();
            await browser.pause(1000);
            console.log('✔ Got It modal dismissed');
            return true;
          }
        }
      } catch (err) {
        // try next
      }
    }

    console.log('ℹ No Got It modal present');
    return false;
  } catch (error) {
    console.log('⚠ Error checking Got It modal (non-critical):', error.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 2 — REQUEST-SPECIFIC HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Click the serve/process button on a waiting-list row.
 * Orange rows (tr.orange-row) are used in the Requests page.
 * @param {number} rowIndex - 0-based index of the orange row to serve
 */
async function serveRequestRow(rowIndex = 0) {
  console.log(`Serving request row ${rowIndex}...`);

  const serveSelectors = [
    'tr.orange-row div:nth-of-type(3) span',
    'tr.orange-row button span',
    'tr.orange-row button',
  ];

  for (const selector of serveSelectors) {
    try {
      const buttons = await $$(selector);
      if (buttons.length > rowIndex) {
        await buttons[rowIndex].click();
        await browser.pause(2000);
        console.log(`✔ Serve button clicked (orange row ${rowIndex})`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  // Fallback: any button in the nth table row
  const allRows = await $$('table tbody tr');
  if (allRows.length > rowIndex) {
    const btn = await allRows[rowIndex].$('button').catch(() => null);
    if (btn) {
      await btn.click();
      await browser.pause(2000);
      console.log('✔ Fallback serve button clicked');
      return true;
    }
  }

  throw new Error('Serve button not found in requests table');
}

/**
 * Fill in the consultation notes form fields.
 * Field IDs from Request.json steps 8–15.
 *
 * @param {Object} notes
 * @param {string} [notes.presentingComplaints]
 * @param {string} [notes.clinicalFindings]
 * @param {string} [notes.historyNotes]
 * @param {string} [notes.treatmentPlan]
 */
async function fillConsultationNotes(notes = {}) {
  console.log('Filling consultation notes...');

  const fieldMap = [
    { key: 'presentingComplaints', selector: '#chief_complaint', label: 'Presenting Complaints' },
    { key: 'clinicalFindings', selector: '#examination_notes', label: 'Clinical Findings' },
    { key: 'historyNotes', selector: '#history_notes', label: 'History of Presenting Complaints' },
    { key: 'treatmentPlan', selector: '#treatment_plan', label: 'Treatment Plan' },
  ];

  for (const { key, selector, label } of fieldMap) {
    const value = notes[key];
    if (value !== undefined && value !== null) {
      try {
        const field = await $(selector);
        await field.click();
        await browser.pause(300);
        await field.clearValue();
        await field.setValue(value.toString());
        await browser.pause(300);
        console.log(`✔ ${label}: ${value}`);
      } catch (err) {
        console.log(`⚠ Could not fill ${label}: ${err.message}`);
      }
    }
  }

  console.log('✔ Consultation notes filled');
}

/**
 * Add a diagnosis entry.
 * Flow from Request.json steps 16–19:
 *   click "Add New Diagnosis" → type search → pick first dropdown result.
 *
 * @param {string} diagnosisSearch - Search term (e.g. 'malaria', 'test')
 */
async function addDiagnosis(diagnosisSearch = 'test') {
  console.log(`Adding diagnosis: "${diagnosisSearch}"...`);

  // Click Add New Diagnosis button
  const addBtnSelectors = [
    'text/Add New Diagnosis',
    'button*=Add New Diagnosis',
    '//button[contains(.,"Add New Diagnosis")]',
    'div.ant-col > div > div.flex > button > span:nth-of-type(2)',
  ];

  let addBtnClicked = false;
  for (const selector of addBtnSelectors) {
    try {
      const btns = await $$(selector);
      if (btns.length > 0) {
        await btns[0].click();
        await browser.pause(1000);
        addBtnClicked = true;
        console.log(`✔ Add New Diagnosis clicked using: ${selector}`);
        break;
      }
    } catch (err) {
      // try next
    }
  }

  if (!addBtnClicked) {
    throw new Error('Add New Diagnosis button not found');
  }

  // Fill diagnosis search input
  // ID "1_disease_description" is CSS-escaped as \31 _disease_description
  const inputSelectors = [
    '#\\31 _disease_description',
    '[id$="_disease_description"]',
    'aria/Search or type diagnosis',
    '[placeholder*="diagnosis"]',
  ];

  let inputFilled = false;
  for (const selector of inputSelectors) {
    try {
      const input = await $(selector);
      await input.click();
      await browser.pause(300);
      await input.setValue(diagnosisSearch);
      await browser.pause(1500);
      inputFilled = true;
      console.log(`✔ Diagnosis input filled using: ${selector}`);
      break;
    } catch (err) {
      // try next
    }
  }

  if (!inputFilled) {
    throw new Error('Diagnosis input field not found');
  }

  // Pick first option from the dropdown
  const optionSelectors = [
    'div.ant-select-item-option-active > div',
    'div.ant-select-item-option > div',
    '.ant-select-dropdown .ant-select-item',
  ];

  for (const selector of optionSelectors) {
    try {
      await browser.waitUntil(async () => (await $$(selector)).length > 0, {
        timeout: 5000,
        timeoutMsg: `Diagnosis dropdown not appeared: ${selector}`,
      });
      const options = await $$(selector);
      if (options.length > 0) {
        await options[0].click();
        await browser.pause(500);
        console.log(`✔ Diagnosis option selected using: ${selector}`);
        break;
      }
    } catch (err) {
      // try next
    }
  }

  console.log('✔ Diagnosis added');
  return true;
}

/**
 * Click the "Save Notes & Admit" button.
 * From Request.json step 20.
 */
async function clickSaveNotesAndAdmit() {
  console.log('Clicking Save Notes & Admit...');

  const selectors = [
    'text/Save Notes & Admit',
    'button*=Save Notes & Admit',
    '//button[contains(.,"Save Notes & Admit")]',
    'button.bg-orange-500 > span:nth-of-type(2)',
  ];

  for (const selector of selectors) {
    try {
      const btns = await $$(selector);
      if (btns.length > 0) {
        await btns[0].click();
        await browser.pause(2000);
        console.log(`✔ Save Notes & Admit clicked using: ${selector}`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  throw new Error('Save Notes & Admit button not found');
}

/**
 * Fill the Admit modal: ward, urgency, admission instructions.
 * From Request.json steps 21–27.
 *
 * @param {Object} admitData
 * @param {string} [admitData.ward]
 * @param {string} [admitData.urgency]
 * @param {string} [admitData.admissionInstructions]
 */
async function fillAdmitForm(admitData = {}) {
  console.log('Filling admit form...');

  // Ward
  if (admitData.ward) {
    try {
      const wardField = await $('#ward_id');
      await wardField.click();
      await browser.pause(300);
      await wardField.setValue(admitData.ward);
      await browser.pause(1000);

      const wardOption = await $('div.ant-select-item-option-active > div').catch(() => null);
      if (wardOption) {
        await wardOption.click();
        await browser.pause(500);
      }
      console.log(`✔ Ward: ${admitData.ward}`);
    } catch (err) {
      console.log(`⚠ Could not fill ward: ${err.message}`);
    }
  }

  // Urgency
  if (admitData.urgency) {
    try {
      const urgencyField = await $('#urgency');
      await urgencyField.click();
      await browser.pause(500);

      const urgencyOptionSelectors = [
        'div.ant-select-item-option-active > div',
        `div[title="${admitData.urgency}"]`,
        `//div[contains(@class,"ant-select-item") and contains(.,"${admitData.urgency}")]`,
      ];

      for (const sel of urgencyOptionSelectors) {
        try {
          const opts = await $$(sel);
          if (opts.length > 0) {
            await opts[0].click();
            await browser.pause(500);
            console.log(`✔ Urgency: ${admitData.urgency}`);
            break;
          }
        } catch (err) {
          // try next
        }
      }
    } catch (err) {
      console.log(`⚠ Could not fill urgency: ${err.message}`);
    }
  }

  // Admission Instructions
  if (admitData.admissionInstructions) {
    try {
      const instrField = await $('#admission_instructions');
      await instrField.click();
      await browser.pause(300);
      await instrField.clearValue();
      await instrField.setValue(admitData.admissionInstructions);
      await browser.pause(300);
      console.log('✔ Admission Instructions filled');
    } catch (err) {
      console.log(`⚠ Could not fill admission instructions: ${err.message}`);
    }
  }

  console.log('✔ Admit form filled');
}

/**
 * Click the final "Save & Admit" button to complete the admission.
 * From Request.json step 28.
 */
async function clickSaveAndAdmit() {
  console.log('Clicking Save & Admit...');

  const selectors = [
    'text/Save & Admit',
    'button*=Save & Admit',
    '//button[contains(.,"Save & Admit") and not(contains(.,"Notes"))]',
    'div.ant-collapse-content > div > div > div > div > div > div > div:nth-of-type(3) span:nth-of-type(2)',
  ];

  for (const selector of selectors) {
    try {
      const btns = await $$(selector);
      if (btns.length > 0) {
        await btns[0].click();
        await browser.pause(2000);
        console.log(`✔ Save & Admit clicked using: ${selector}`);
        return true;
      }
    } catch (err) {
      // try next
    }
  }

  throw new Error('Save & Admit button not found');
}

// ─────────────────────────────────────────────────────────────
// SECTION 3 — PUBLIC API: REQUESTS FLOW
// ─────────────────────────────────────────────────────────────

/**
 * Navigate to the Consultation Requests page.
 * Menu path: Consultation submenu → Requests
 */
export async function openConsultationRequests() {
  await navigateToConsultationPage('Requests');
  console.log('✔ Consultation Requests page opened');
}

/**
 * Full flow: open Requests page → serve a row → fill notes →
 *            add diagnosis → save & admit.
 *
 * @param {Object}  [options]
 * @param {number}  [options.rowIndex=0]            - 0-based orange-row index to serve
 * @param {Object}  [options.notes]                 - Consultation note fields
 * @param {string}  [options.notes.presentingComplaints='test']
 * @param {string}  [options.notes.clinicalFindings='test']
 * @param {string}  [options.notes.historyNotes='test']
 * @param {string}  [options.notes.treatmentPlan='test']
 * @param {string}  [options.diagnosisSearch='test'] - Diagnosis search term
 * @param {Object}  [options.admitData]              - Admission form data
 * @param {string}  [options.admitData.ward='te']
 * @param {string}  [options.admitData.urgency]
 * @param {string}  [options.admitData.admissionInstructions='test']
 */
export async function processConsultationRequest({
  rowIndex = 0,
  notes = {
    presentingComplaints: 'test',
    clinicalFindings: 'test',
    historyNotes: 'test',
    treatmentPlan: 'test',
  },
  diagnosisSearch = 'test',
  admitData = {
    ward: 'te',
    urgency: null,
    admissionInstructions: 'test',
  },
} = {}) {
  console.log('=== PROCESS CONSULTATION REQUEST ===');

  try {
    await openConsultationRequests();
    await serveRequestRow(rowIndex);
    await dismissGotItModal();
    await fillConsultationNotes(notes);
    await addDiagnosis(diagnosisSearch);
    await clickSaveNotesAndAdmit();
    await fillAdmitForm(admitData);
    await clickSaveAndAdmit();

    console.log('=== CONSULTATION REQUEST PROCESSED SUCCESSFULLY ===');
    return { status: 'success', flow: 'request', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('PROCESS CONSULTATION REQUEST FAILED:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 4 — PUBLIC API: PENDING FLOW
// ─────────────────────────────────────────────────────────────

/**
 * Navigate to the Pending Consultation page.
 * Menu path: Consultation submenu → Pending Consultation
 */
export async function openPendingConsultation() {
  await navigateToConsultationPage('Pending Consultation');
  console.log('✔ Pending Consultation page opened');
}

/**
 * Return all data rows currently visible in the pending consultation table.
 */
export async function listPendingConsultations() {
  console.log('=== LIST PENDING CONSULTATIONS ===');

  try {
    await openPendingConsultation();
    const rows = await getTableRows();
    console.log(`✔ Found ${rows.length} pending consultations`);
    return rows;
  } catch (error) {
    console.error('LIST PENDING CONSULTATIONS FAILED:', error.message);
    throw error;
  }
}

/**
 * Full flow: open Pending page → interact with a row's action buttons →
 *            optionally close the resulting modal/drawer.
 * Mirrors Pending.json steps 5–8.
 *
 * @param {Object}  [options]
 * @param {number}  [options.rowIndex=6]     - 1-based row index (nth-of-type)
 * @param {boolean} [options.closeAfter=true] - Close modal after interaction
 */
export async function viewPendingConsultation({ rowIndex = 6, closeAfter = true } = {}) {
  console.log('=== VIEW PENDING CONSULTATION ===');

  try {
    await openPendingConsultation();

    // Recording steps 5 & 6: same button clicked twice
    await clickRowAction(rowIndex, 3);
    await clickRowAction(rowIndex, 3);

    // Recording step 7: second action button in the same row
    await clickRowAction(rowIndex, 4);

    if (closeAfter) {
      await closeModal();
    }

    console.log('=== PENDING CONSULTATION FLOW COMPLETED ===');
    return { status: 'success', flow: 'pending', rowIndex, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('VIEW PENDING CONSULTATION FAILED:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 5 — APPOINTMENTS-SPECIFIC HELPERS (calendar view)
// ─────────────────────────────────────────────────────────────

/**
 * Get all visible appointment event elements from the calendar.
 * The appointments page is a monthly calendar — events are rendered as
 * labelled pill/chip elements inside day cells, NOT table rows.
 */
async function getCalendarEvents() {
  const eventSelectors = [
    '.ant-badge-status-text', // ✔ confirmed working selector
    '.ant-picker-calendar-date-content li', // Ant Design calendar list items
    '.fc-event', // FullCalendar event
    '.fc-daygrid-event', // FullCalendar day-grid event
    'ul.events li', // generic events list
    '[class*="calendar"] [class*="event"]', // generic fallback
  ];

  for (const selector of eventSelectors) {
    try {
      const events = await $$(selector);
      if (events.length > 0) {
        console.log(`✔ Found ${events.length} calendar events using: ${selector}`);
        return events;
      }
    } catch (err) {
      // try next
    }
  }

  console.log('⚠ No calendar events found');
  return [];
}

/**
 * Click a single calendar appointment event by 0-based index.
 * @param {number} eventIndex - Which event to click (default: 0 = first visible event)
 */
async function clickCalendarEvent(eventIndex = 0) {
  console.log(`Clicking calendar event at index ${eventIndex}...`);

  const events = await getCalendarEvents();

  if (events.length === 0) {
    throw new Error('No calendar appointment events found on page');
  }

  if (eventIndex >= events.length) {
    throw new Error(
      `Event index ${eventIndex} out of range — only ${events.length} events visible`
    );
  }

  await events[eventIndex].click();
  await browser.pause(1500);
  console.log(`✔ Calendar event ${eventIndex} clicked`);
  return true;
}

// ─────────────────────────────────────────────────────────────
// SECTION 6 — PUBLIC API: APPOINTMENTS FLOW
// ─────────────────────────────────────────────────────────────

/**
 * Navigate to the Consultation Appointments page.
 * Menu path: Consultation submenu → Appointments
 */
export async function openConsultationAppointments() {
  await navigateToConsultationPage('Appointments');
  console.log('✔ Consultation Appointments page opened');
}

/**
 * Return all visible calendar event elements from the appointments page.
 */
export async function listConsultationAppointments() {
  console.log('=== LIST CONSULTATION APPOINTMENTS ===');

  try {
    await openConsultationAppointments();
    const events = await getCalendarEvents();
    console.log(`✔ Found ${events.length} calendar appointments`);
    return events;
  } catch (error) {
    console.error('LIST CONSULTATION APPOINTMENTS FAILED:', error.message);
    throw error;
  }
}

/**
 * Navigate to Appointments, click one calendar event, then close the modal.
 * Appointments render as a monthly calendar — clicking an event pill opens
 * the detail modal/drawer.
 *
 * @param {Object}  [options]
 * @param {number}  [options.eventIndex=0]     - 0-based index of the calendar event to open
 * @param {boolean} [options.closeAfter=true]  - Whether to close the modal after viewing
 */
export async function viewConsultationAppointment({ eventIndex = 0, closeAfter = true } = {}) {
  console.log('=== VIEW CONSULTATION APPOINTMENT ===');

  try {
    await openConsultationAppointments();
    await clickCalendarEvent(eventIndex);

    if (closeAfter) {
      await closeModal();
    }

    console.log('=== CONSULTATION APPOINTMENT FLOW COMPLETED ===');
    return {
      status: 'success',
      flow: 'appointment',
      eventIndex,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('VIEW CONSULTATION APPOINTMENT FAILED:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 7 — NAMED EXPORTS OF SHARED LOW-LEVEL HELPERS
// (available for fine-grained use in individual test files)
// ─────────────────────────────────────────────────────────────

export {
  // Navigation
  openConsultationSubmenu,
  clickConsultationMenuLink,
  navigateToConsultationPage,

  // Table interaction (Requests & Pending pages)
  clickRowAction,
  getTableRows,

  // Calendar interaction (Appointments page)
  getCalendarEvents,
  clickCalendarEvent,

  // Modals
  closeModal,
  dismissGotItModal,

  // Request-specific steps
  serveRequestRow,
  fillConsultationNotes,
  addDiagnosis,
  clickSaveNotesAndAdmit,
  fillAdmitForm,
  clickSaveAndAdmit,
};
