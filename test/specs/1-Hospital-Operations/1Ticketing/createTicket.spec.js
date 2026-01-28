import { createTicket } from '../../../helpers/TicketingHelper.js';

describe('Ticketing - Create Ticket', () => {
  it('should create a new ticket', async () => {
    await createTicket({
      subject: 'Network Issue',
      description: 'Cannot connect to VPN on floor 2'
    });
    
    // Verify success
    const success = await $('.success-message, .alert-success').isDisplayed().catch(() => false);
    expect(success).toBe(true);
  });
});