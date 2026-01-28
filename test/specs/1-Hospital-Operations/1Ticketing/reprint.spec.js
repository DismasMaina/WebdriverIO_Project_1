import { reprintTicket } from '../../helpers/TicketingHelper.js';

describe('Ticketing - Reprint', () => {
  it('should reprint a ticket', async () => {
    await reprintTicket('TKT-001'); // Optional: pass ticket ID
    
    // Verify reprint modal or success
    const modal = await $('.modal, .reprint-confirmation, .ticket-preview').isDisplayed().catch(() => false);
    expect(modal).toBe(true);
  });
});