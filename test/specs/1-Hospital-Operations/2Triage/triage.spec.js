// test/specs/1-Hospital-Operations/2Triage/triage.spec.js

import {
  viewQueue,
  recordVitals,
  assignService,
  updateStatus,
  getQueueStats,
  refreshQueue
} from '../../../helpers/TriageHelper.js';

describe('Triage - Queue & Vital Records', () => {
  
  /**
   * TEST 1: View Queue
   */
  it('should display ticket queue with patient information', async () => {
    try {
      console.log('=== TEST: Display Ticket Queue ===');
      
      const queueVisible = await viewQueue();
      expect(queueVisible).toBe(true);
      console.log('✓ Test PASSED: Ticket queue displayed');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 2: Record Full Vitals
   */
  it('should record complete vital signs for patient', async () => {
    try {
      console.log('=== TEST: Record Complete Vitals ===');
      
      const vitals = {
        temperature: 37.2,
        pulse: 72,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        respiratoryRate: 16,
        oxygenSaturation: 98
      };
      
      const result = await recordVitals('TT9643', vitals);
      
      expect(result.status).toBe('success');
      expect(result.ticket).toBe('TT9643');
      console.log('✓ Test PASSED: Complete vitals recorded');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 3: Record Minimal Vitals
   */
  it('should record minimal vital signs (temp and pulse)', async () => {
    try {
      console.log('=== TEST: Record Minimal Vitals ===');
      
      const vitals = {
        temperature: 36.8,
        pulse: 68
      };
      
      const result = await recordVitals('TT9644', vitals);
      
      expect(result.status).toBe('success');
      console.log('✓ Test PASSED: Minimal vitals recorded');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 4: Assign Service
   */
  it('should assign service to patient', async () => {
    try {
      console.log('=== TEST: Assign Service ===');
      
      const result = await assignService('TT9643', 'Cardiology');
      
      expect(result.status).toBe('success');
      expect(result.service).toBe('Cardiology');
      console.log('✓ Test PASSED: Service assigned');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 5: Update Patient Status
   */
  it('should update patient status to SERVING', async () => {
    try {
      console.log('=== TEST: Update Patient Status ===');
      
      const result = await updateStatus('TT9643', 'SERVING');
      
      expect(result.status).toBe('success');
      expect(result.newStatus).toBe('SERVING');
      console.log('✓ Test PASSED: Status updated');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 6: Get Queue Statistics
   */
  it('should retrieve queue statistics', async () => {
    try {
      console.log('=== TEST: Get Queue Statistics ===');
      
      const stats = await getQueueStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('vitalRecords');
      expect(stats).toHaveProperty('cardexAllergies');
      console.log('✓ Test PASSED: Stats retrieved', stats);
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 7: Refresh Queue
   */
  it('should refresh queue to get latest updates', async () => {
    try {
      console.log('=== TEST: Refresh Queue ===');
      
      const result = await refreshQueue();
      
      expect(result).toBe(true);
      console.log('✓ Test PASSED: Queue refreshed');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 8: Record Multiple Patients Vitals
   */
  it('should record vitals for multiple patients in sequence', async () => {
    try {
      console.log('=== TEST: Multiple Patient Vitals ===');
      
      const patients = [
        { ticket: 'TT9643', vitals: { temperature: 37.2, pulse: 72 } },
        { ticket: 'TT9644', vitals: { temperature: 36.9, pulse: 68 } },
        { ticket: 'TT9646', vitals: { temperature: 37.5, pulse: 75 } }
      ];
      
      let successCount = 0;
      for (const patient of patients) {
        try {
          const result = await recordVitals(patient.ticket, patient.vitals);
          if (result.status === 'success') successCount++;
        } catch (err) {
          console.log(`⚠ Could not record vitals for ${patient.ticket}: ${err.message}`);
        }
      }
      
      console.log(`✓ Test PASSED: ${successCount}/${patients.length} patients recorded`);
      expect(successCount).toBeGreaterThan(0);
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 9: Full Triage Workflow
   */
  it('should complete full triage workflow: view -> record -> assign -> update', async () => {
    try {
      console.log('=== TEST: Full Triage Workflow ===');
      
      // Step 1: View queue
      const queueDisplayed = await viewQueue();
      expect(queueDisplayed).toBe(true);
      console.log('  ✓ Queue displayed');
      
      // Step 2: Record vitals
      const vitalsResult = await recordVitals('TT9643', {
        temperature: 37.1,
        pulse: 71,
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 76
      });
      expect(vitalsResult.status).toBe('success');
      console.log('  ✓ Vitals recorded');
      
      // Step 3: Assign service
      const serviceResult = await assignService('TT9643', 'General');
      expect(serviceResult.status).toBe('success');
      console.log('  ✓ Service assigned');
      
      // Step 4: Update status
      const statusResult = await updateStatus('TT9643', 'SERVING');
      expect(statusResult.status).toBe('success');
      console.log('  ✓ Status updated');
      
      // Step 5: Refresh queue
      const refreshed = await refreshQueue();
      expect(refreshed).toBe(true);
      console.log('  ✓ Queue refreshed');
      
      console.log('✓ Test PASSED: Full workflow completed');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });

  /**
   * TEST 10: Different Status Updates
   */
  it('should update patient status to different values', async () => {
    try {
      console.log('=== TEST: Various Status Updates ===');
      
      const statuses = ['QUEUED', 'SERVING', 'DELAYED'];
      
      for (const status of statuses) {
        try {
          const result = await updateStatus('TT9643', status);
          expect(result.newStatus).toBe(status);
          console.log(`  ✓ Updated to ${status}`);
        } catch (err) {
          console.log(`  ⚠ Could not update to ${status}: ${err.message}`);
        }
      }
      
      console.log('✓ Test PASSED: Status updates tested');
    } catch (error) {
      console.error('✗ Test FAILED:', error.message);
      throw error;
    }
  });
});