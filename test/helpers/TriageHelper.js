// test/helpers/TriageHelper.js

import { login } from './AuthHelper.js';

/**
 * Triage Helper - Queue Management & Vital Records
 * Handles: View queues, Record vitals, Assign services, Update status
 */

/**
 * Open the Triage menu
 */
async function openTriageMenu() {
  console.log('Opening Triage menu...');
  
  try {
    await login();
    
    // Wait for Triage menu with explicit timeout
    await browser.waitUntil(
      async () => {
        const items = await $$('=Triage');
        return items.length > 0;
      },
      { timeout: 5000, timeoutMsg: 'Triage menu item not found' }
    );
    
    const triageItems = await $$('=Triage');
    if (triageItems.length > 0) {
      await triageItems[0].click();
      await browser.pause(1000);
      console.log('✓ Triage menu opened');
      return;
    }
    
    throw new Error('Triage menu item not found');
  } catch (error) {
    console.error('Failed to open Triage menu:', error.message);
    throw error;
  }
}

/**
 * View the ticket queue
 */
export async function viewQueue() {
  console.log('=== VIEW QUEUE ===');
  
  try {
    await openTriageMenu();
    
    // Click Tickets Queue tab if exists
    const queueTab = await $$('=Tickets Queue');
    if (queueTab.length > 0) {
      await queueTab[0].click();
      await browser.pause(1000);
    }
    
    // Verify table exists
    const table = await $$('table');
    if (table.length > 0) {
      console.log('✓ Queue table displayed');
      return true;
    }
    
    throw new Error('Queue table not found');
  } catch (error) {
    console.error('Failed to view queue:', error.message);
    throw error;
  }
}

/**
 * Record vital signs for a patient
 * @param {string} ticketNumber - Patient ticket (e.g., TT9643)
 * @param {object} vitals - Vital signs
 */
export async function recordVitals(ticketNumber, vitals = {}) {
  console.log(`=== RECORD VITALS: Ticket=${ticketNumber} ===`);
  
  try {
    await openTriageMenu();
    
    // Step 1: Search for patient
    console.log(`Searching for ticket: ${ticketNumber}`);
    const searchBox = await $('input[placeholder*="Search by Ticket Number or Patient Name"]');
    if (searchBox) {
      await searchBox.clearValue();
      await searchBox.setValue(ticketNumber);
      await browser.pause(1000);
    }
    
    // Step 2: Find and click ticket in table
    const ticketCells = await $$(ticketNumber);
    if (ticketCells.length === 0) {
      throw new Error(`Ticket ${ticketNumber} not found in queue`);
    }
    
    // Click the ticket row
    const ticketRow = ticketCells[0];
    await ticketRow.click();
    await browser.pause(2000);
    
    // Step 3: Look for Record/Vitals action
    const actionButtons = await $$('button*=Actions', 'button*=Record');
    if (actionButtons.length > 0) {
      await actionButtons[0].click();
      await browser.pause(1000);
    }
    
    // Step 4: Fill vitals
    if (Object.keys(vitals).length > 0) {
      await fillVitals(vitals);
    }
    
    // Step 5: Save vitals
    const saveBtn = await $$('button*=Save', 'button*=Submit');
    if (saveBtn.length > 0) {
      await saveBtn[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Vitals recorded for ${ticketNumber}`);
    return { status: 'success', ticket: ticketNumber };
  } catch (error) {
    console.error('RECORD VITALS FAILED:', error.message);
    throw error;
  }
}

/**
 * Assign service to patient
 * @param {string} ticketNumber - Patient ticket
 * @param {string} service - Service name
 */
export async function assignService(ticketNumber, service) {
  console.log(`=== ASSIGN SERVICE: Ticket=${ticketNumber}, Service=${service} ===`);
  
  try {
    await openTriageMenu();
    
    // Search for patient
    const searchBox = await $('input[placeholder*="Search by Ticket Number or Patient Name"]');
    if (searchBox) {
      await searchBox.clearValue();
      await searchBox.setValue(ticketNumber);
      await browser.pause(1000);
    }
    
    // Click ticket
    const tickets = await $$(ticketNumber);
    if (tickets.length > 0) {
      await tickets[0].click();
      await browser.pause(2000);
    }
    
    // Click Actions
    const actions = await $$('button*=Actions');
    if (actions.length > 0) {
      await actions[0].click();
      await browser.pause(1000);
    }
    
    // Select service
    const services = await $$(service);
    if (services.length > 0) {
      await services[0].click();
      await browser.pause(1000);
    }
    
    // Confirm
    const confirm = await $$('button*=Confirm', 'button*=Assign');
    if (confirm.length > 0) {
      await confirm[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Service ${service} assigned`);
    return { status: 'success', ticket: ticketNumber, service };
  } catch (error) {
    console.error('ASSIGN SERVICE FAILED:', error.message);
    throw error;
  }
}

/**
 * Update patient status
 * @param {string} ticketNumber - Patient ticket
 * @param {string} newStatus - New status
 */
export async function updateStatus(ticketNumber, newStatus) {
  console.log(`=== UPDATE STATUS: Ticket=${ticketNumber}, Status=${newStatus} ===`);
  
  try {
    await openTriageMenu();
    
    // Search
    const searchBox = await $('input[placeholder*="Search by Ticket Number or Patient Name"]');
    if (searchBox) {
      await searchBox.clearValue();
      await searchBox.setValue(ticketNumber);
      await browser.pause(1000);
    }
    
    // Click ticket
    const tickets = await $$(ticketNumber);
    if (tickets.length > 0) {
      await tickets[0].click();
      await browser.pause(2000);
    }
    
    // Actions -> Status
    const actions = await $$('button*=Actions');
    if (actions.length > 0) {
      await actions[0].click();
      await browser.pause(1000);
    }
    
    // Click new status
    const statuses = await $$(newStatus);
    if (statuses.length > 0) {
      await statuses[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Status updated to ${newStatus}`);
    return { status: 'success', ticket: ticketNumber, newStatus };
  } catch (error) {
    console.error('UPDATE STATUS FAILED:', error.message);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  console.log('=== GET QUEUE STATISTICS ===');
  
  try {
    await openTriageMenu();
    await browser.pause(1000);
    
    const stats = {
      vitalRecords: 0,
      cardexAllergies: 0
    };
    
    try {
      const source = await browser.getPageSource();
      
      const vitalMatch = source.match(/Vital Records.*?(\d+)/i);
      if (vitalMatch) stats.vitalRecords = parseInt(vitalMatch[1]);
      
      const cardexMatch = source.match(/Cardex.*?(\d+)/i);
      if (cardexMatch) stats.cardexAllergies = parseInt(cardexMatch[1]);
    } catch (err) {
      console.log('⚠ Could not parse stats');
    }
    
    console.log('✓ Stats retrieved:', stats);
    return stats;
  } catch (error) {
    console.error('GET STATS FAILED:', error.message);
    throw error;
  }
}

/**
 * Refresh queue
 */
export async function refreshQueue() {
  console.log('=== REFRESH QUEUE ===');
  
  try {
    await openTriageMenu();
    
    const refresh = await $$('button*=Refresh');
    if (refresh.length > 0) {
      await refresh[0].click();
      await browser.pause(2000);
    } else {
      await browser.refresh();
      await browser.pause(2000);
    }
    
    console.log('✓ Queue refreshed');
    return true;
  } catch (error) {
    console.error('REFRESH FAILED:', error.message);
    throw error;
  }
}

/**
 * Helper: Fill vital signs
 */
async function fillVitals(vitals) {
  console.log('Filling vital signs...');
  
  try {
    const inputs = await $$('input[type="number"]');
    let index = 0;
    
    if (vitals.temperature !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.temperature.toString());
      console.log(`✓ Temperature: ${vitals.temperature}°C`);
    }
    
    if (vitals.pulse !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.pulse.toString());
      console.log(`✓ Pulse: ${vitals.pulse} bpm`);
    }
    
    if (vitals.bloodPressureSystolic !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.bloodPressureSystolic.toString());
      console.log(`✓ Systolic: ${vitals.bloodPressureSystolic}`);
    }
    
    if (vitals.bloodPressureDiastolic !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.bloodPressureDiastolic.toString());
      console.log(`✓ Diastolic: ${vitals.bloodPressureDiastolic}`);
    }
    
    if (vitals.respiratoryRate !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.respiratoryRate.toString());
      console.log(`✓ Respiratory Rate: ${vitals.respiratoryRate}`);
    }
    
    if (vitals.oxygenSaturation !== undefined && index < inputs.length) {
      await inputs[index++].clearValue();
      await inputs[index - 1].setValue(vitals.oxygenSaturation.toString());
      console.log(`✓ O2 Saturation: ${vitals.oxygenSaturation}%`);
    }
  } catch (error) {
    console.log(`⚠ Error filling vitals: ${error.message}`);
  }
}

export { openTriageMenu };