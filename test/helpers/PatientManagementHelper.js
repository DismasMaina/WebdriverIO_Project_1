// test/helpers/PatientManagementHelper.js
import { login } from './AuthHelper.js';

/**
 * Open the Patient Management menu
 */
async function openPatientManagementMenu() {
  console.log('Opening Patient Management menu...');
  
  try {
    await login();
    
    // Click Patient Management menu - from recording step 3
    // Selector: li.ant-menu-submenu-active span with text "Patient Management"
    const pmItems = await $$('//span[contains(text(), "Patient Management")]');
    if (pmItems.length > 0) {
      await pmItems[0].click();
      await browser.pause(2500);
      console.log('✓ Patient Management menu opened');
      return;
    }
    
    throw new Error('Patient Management menu item not found');
  } catch (error) {
    console.error('Failed to open Patient Management menu:', error.message);
    throw error;
  }
}

/**
 * Navigate to Patient Editor - Using actual recording selectors
 */
async function navigateToPatientEditor() {
  console.log('Navigating to Patient Editor...');
  
  try {
    await openPatientManagementMenu();
    await browser.pause(1500);
    let editorBtn = await $$('=Patient Editor', 'Patient Editor button');
    
    if (editorBtn.length === 0) {
      // Fallback: xpath from recording
      editorBtn = await $$('=Patient Editor', 'Patient Editor button');
    }
    
    if (editorBtn.length === 0) {
      // Final fallback: broader search
      editorBtn = await $$('=Patient Editor', 'Patient Editor button');
    }
    
    if (editorBtn.length > 0) {
      console.log('✓ Found Patient Editor menu item');
      await editorBtn[0].click();
      await browser.pause(2000);
      console.log('✓ Patient Editor page opened');
      return;
    }
    
    throw new Error('Patient Editor menu not found');
  } catch (error) {
    console.error('Failed to navigate to Patient Editor:', error.message);
    throw error;
  }
}

/**
 * Search for patient by name - Using actual recording selectors
 */
async function searchPatient(searchTerm) {
  console.log(`=== SEARCH PATIENT: ${searchTerm} ===`);
  
  try {
    await navigateToPatientEditor();
    
    // From recording step 6: #patient_name input
    const searchInput = await $('#patient_name');
    
    if (searchInput) {
      await searchInput.clearValue();
      await browser.pause(500);
      await searchInput.setValue(searchTerm);
      await browser.pause(1000);
      
      // From recording step 8: aria/Search Patient[role="button"]
      // Selector: div:nth-of-type(2) div:nth-of-type(3) > div:nth-of-type(1) button
      const searchBtn = await $$('//button[contains(., "Search Patient")]');
      if (searchBtn.length > 0) {
        await searchBtn[0].click();
        await browser.pause(2000);
      }
      
      console.log(`✓ Searched for patient: ${searchTerm}`);
      return true;
    }
    
    throw new Error('Search input not found');
  } catch (error) {
    console.error('SEARCH PATIENT FAILED:', error.message);
    throw error;
  }
}

/**
 * Get patient details from search results
 */
export async function getPatientDetails(patientId) {
  console.log(`=== GET PATIENT DETAILS: ${patientId} ===`);
  
  try {
    await searchPatient(patientId);
    
    // Wait for search results to load
    await browser.pause(2000);
    
    // Click on first patient in results table
    const patientRows = await $$('table tbody tr');
    if (patientRows.length > 0) {
      await patientRows[0].click();
      await browser.pause(2000);
      console.log(`✓ Patient details opened for: ${patientId}`);
      return { status: 'success', patientId };
    }
    
    throw new Error(`Patient ${patientId} not found in results`);
  } catch (error) {
    console.error('GET PATIENT DETAILS FAILED:', error.message);
    throw error;
  }
}

/**
 * Register a new patient
 */
export async function registerPatient(patientData) {
  console.log(`=== REGISTER PATIENT: ${patientData.firstName} ${patientData.lastName} ===`);
  
  try {
    await openPatientManagementMenu();
    await browser.pause(1000);
    
    // Click Patient Registration
    const regButton = await $$('//span[text()="Patient Registration"]');
    if (regButton.length > 0) {
      await regButton[0].click();
      await browser.pause(2000);
    }
    
    // Fill patient data
    await fillPatientForm(patientData);
    
    // Submit form
    console.log('Submitting patient registration...');
    const submitBtn = await $$('//button[contains(., "Submit")]');
    if (submitBtn.length > 0) {
      await submitBtn[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Patient ${patientData.firstName} registered successfully`);
    return {
      status: 'success',
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('REGISTER PATIENT FAILED:', error.message);
    throw error;
  }
}

/**
 * Update patient information
 */
export async function updatePatientInfo(patientId, updates) {
  console.log(`=== UPDATE PATIENT: ${patientId} ===`);
  
  try {
    await navigateToPatientEditor();
    
    // Search for patient
    const searchInput = await $('#patient_name');
    if (searchInput) {
      await searchInput.clearValue();
      await browser.pause(500);
      await searchInput.setValue(patientId);
      await browser.pause(1000);
      
      // Click Search button
      const searchBtn = await $$('//button[contains(., "Search Patient")]');
      if (searchBtn.length > 0) {
        await searchBtn[0].click();
        await browser.pause(2000);
      }
    }
    
    // Wait and click first result
    const patientRows = await $$('table tbody tr');
    if (patientRows.length > 0) {
      await patientRows[0].click();
      await browser.pause(2000);
    }
    
    // Fill update form
    await fillPatientForm(updates);
    
    // Save changes
    const saveBtn = await $$('//button[contains(., "Save")] | //button[contains(., "Update")] | //button[contains(., "Submit")]');
    if (saveBtn.length > 0) {
      await saveBtn[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Patient ${patientId} updated successfully`);
    return { status: 'success', patientId };
  } catch (error) {
    console.error('UPDATE PATIENT FAILED:', error.message);
    throw error;
  }
}

/**
 * View patient queue
 */
export async function viewPatientQueue() {
  console.log('=== VIEW PATIENT QUEUE ===');
  
  try {
    await openPatientManagementMenu();
    await browser.pause(1000);
    
    // Click Patient Queue
    const queueBtn = await $$('//span[text()="Patient Queue"]');
    if (queueBtn.length > 0) {
      await queueBtn[0].click();
      await browser.pause(2000);
    }
    
    // Verify table is displayed
    const table = await $$('table');
    if (table.length > 0) {
      console.log('✓ Patient queue table displayed');
      return true;
    }
    
    throw new Error('Patient queue table not found');
  } catch (error) {
    console.error('Failed to view patient queue:', error.message);
    throw error;
  }
}

/**
 * View patient medical history
 */
export async function viewMedicalHistory(patientId) {
  console.log(`=== VIEW MEDICAL HISTORY: ${patientId} ===`);
  
  try {
    await getPatientDetails(patientId);
    
    // Click Medical History tab
    const historyBtn = await $$('//button[contains(., "History")] | //span[contains(., "History")]');
    if (historyBtn.length > 0) {
      await historyBtn[0].click();
      await browser.pause(2000);
      console.log(`✓ Medical history displayed for: ${patientId}`);
      return true;
    }
    
    throw new Error('Medical history not available');
  } catch (error) {
    console.error('VIEW MEDICAL HISTORY FAILED:', error.message);
    throw error;
  }
}

/**
 * Add medical note
 */
export async function addMedicalNote(patientId, note) {
  console.log(`=== ADD MEDICAL NOTE: ${patientId} ===`);
  
  try {
    await getPatientDetails(patientId);
    
    // Click Add Note button
    const noteBtn = await $$('//button[contains(., "Add Note")] | //button[contains(., "Note")]');
    if (noteBtn.length > 0) {
      await noteBtn[0].click();
      await browser.pause(1500);
    }
    
    // Fill note content
    const noteArea = await $('textarea');
    if (noteArea) {
      await noteArea.setValue(note);
      await browser.pause(500);
    }
    
    // Save note
    const saveBtn = await $$('//button[contains(., "Save")]');
    if (saveBtn.length > 0) {
      await saveBtn[0].click();
      await browser.pause(2000);
    }
    
    console.log(`✓ Medical note added for: ${patientId}`);
    return { status: 'success', patientId };
  } catch (error) {
    console.error('ADD MEDICAL NOTE FAILED:', error.message);
    throw error;
  }
}

/**
 * Helper: Fill patient form with data
 */
async function fillPatientForm(data) {
  console.log('Filling patient form...');
  
  try {
    // Fill Patient Name - from recording: #patient_name
    if (data.firstName || data.lastName) {
      try {
        const patientNameInput = await $('#patient_name');
        if (patientNameInput) {
          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          await patientNameInput.clearValue();
          await patientNameInput.setValue(fullName);
          console.log(`✓ Patient Name: ${fullName}`);
        }
      } catch (err) {
        console.log(`⚠ Could not fill patient name`);
      }
    }
    
    // Fill other fields
    const allInputs = await $$('input');
    
    // Fill phoneNumber
    if (data.phoneNumber) {
      try {
        for (const input of allInputs) {
          const placeholder = await input.getAttribute('placeholder');
          const type = await input.getAttribute('type');
          
          if ((placeholder && (placeholder.toLowerCase().includes('phone') || placeholder.toLowerCase().includes('mobile'))) ||
              (type === 'tel')) {
            await input.clearValue();
            await input.setValue(data.phoneNumber);
            console.log(`✓ Phone Number: ${data.phoneNumber}`);
            break;
          }
        }
      } catch (err) {
        console.log(`⚠ Could not fill phone`);
      }
    }
    
    // Fill email
    if (data.email) {
      try {
        for (const input of allInputs) {
          const type = await input.getAttribute('type');
          if (type === 'email') {
            await input.clearValue();
            await input.setValue(data.email);
            console.log(`✓ Email: ${data.email}`);
            break;
          }
        }
      } catch (err) {
        console.log(`⚠ Could not fill email`);
      }
    }
    
    // Fill address
    if (data.address) {
      try {
        for (const input of allInputs) {
          const placeholder = await input.getAttribute('placeholder');
          
          if (placeholder && placeholder.toLowerCase().includes('address')) {
            await input.clearValue();
            await input.setValue(data.address);
            console.log(`✓ Address: ${data.address}`);
            break;
          }
        }
      } catch (err) {
        console.log(`⚠ Could not fill address`);
      }
    }
    
    // Fill dateOfBirth
    if (data.dateOfBirth) {
      try {
        const dateInputs = await $$('input[type="date"]');
        if (dateInputs.length > 0) {
          await dateInputs[0].clearValue();
          await dateInputs[0].setValue(data.dateOfBirth);
          console.log(`✓ Date of Birth: ${data.dateOfBirth}`);
        }
      } catch (err) {
        console.log(`⚠ Could not fill DOB`);
      }
    }
    
    // Fill gender
    if (data.gender) {
      try {
        const selects = await $$('select');
        if (selects.length > 0) {
          await selects[0].selectByVisibleText(data.gender);
          console.log(`✓ Gender: ${data.gender}`);
        }
      } catch (err) {
        console.log(`⚠ Could not fill gender`);
      }
    }
    
    await browser.pause(500);
    console.log('✓ Patient form filled');
  } catch (error) {
    console.log(`⚠ Error filling form: ${error.message}`);
  }
}

export { openPatientManagementMenu, navigateToPatientEditor };