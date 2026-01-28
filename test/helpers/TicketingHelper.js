import { login } from './AuthHelper.js';

// Helper to open Ticketing menu
async function openTicketingMenu() {
  await login(); // Full visual login
  
  console.log("Clicking Ticketing menu...");
  await $('=Ticketing').click(); // or await $('#menuTicketing').click();
  await browser.pause(2000);
}

export async function createTicket(data = {
  subject: 'Test Ticket',
  description: 'Automated test ticket'
}) {
  await openTicketingMenu();
  
  console.log("Clicking Create Ticket...");
  await $('=Create Ticket').click();
  await browser.pause(2000);
  
  // Fill form
  console.log("Filling form...");
  await $('[name="subject"], #subject').setValue(data.subject);
  await browser.pause(1000);
  
  await $('[name="description"], #description').setValue(data.description);
  await browser.pause(1000);
  
  console.log("Submitting...");
  await $('button[type="submit"]').click();
  await browser.pause(3000);
  
  console.log("Ticket created!");
}

export async function reprintTicket(ticketId = null) {
  await openTicketingMenu();
  
  console.log("Clicking Ticket Reprint...");
  await $('=Ticket Reprint').click();
  await browser.pause(2000);
  
  if (ticketId) {
    console.log(`Entering ticket ID: ${ticketId}`);
    await $('[name="ticketId"], #ticketId').setValue(ticketId);
    await browser.pause(1000);
  }
  
  console.log("Clicking reprint button...");
  await $('button*=Reprint, #reprintBtn').click();
  await browser.pause(3000);
  
  console.log("Reprint complete!");
}

export async function displayTicket(ticketId = null) {
  await openTicketingMenu();
  
  console.log("Clicking Ticket Display...");
  await $('=Ticket Display').click();
  await browser.pause(2000);
  
  if (ticketId) {
    console.log(`Searching ticket: ${ticketId}`);
    await $('[name="search"], #ticketId').setValue(ticketId);
    await $('button*=Search, #searchBtn').click();
    await browser.pause(2000);
  }
  
  console.log("Displaying ticket details");
  await browser.pause(3000);
}

export async function trackTicket(ticketId = null) {
  await openTicketingMenu();
  
  console.log("Clicking Ticket Tracking...");
  await $('=Ticket Tracking').click();
  await browser.pause(2000);
  
  if (ticketId) {
    console.log(`Tracking ticket: ${ticketId}`);
    await $('[name="ticketId"], #trackingId').setValue(ticketId);
    await $('button*=Track, #trackBtn').click();
    await browser.pause(2000);
  }
  
  console.log("Showing tracking info");
  await browser.pause(3000);
}