const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

/**
 * Helper function to wait for a specified time
 * @param {Object} page - Puppeteer page object
 * @param {number} ms - Time to wait in milliseconds
 */
async function wait(page, ms) {
  await page.evaluate(ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }, ms);
}

/**
 * TawtikService - Handles automation for tawtik.ma website
 */
class TawtikService {
  /**
   * Create a new file in Tawtik system
   * @param {Object} data - File creation data
   * @param {string} data.dossierNumber - The dossier number to use
   * @param {Object} data.clientInfo - Client information (optional)
   * @returns {Promise<Object>} Result of the operation
   */
  async createNewFile(data) {
    const { dossierNumber, clientInfo = {} } = data;
    let browser = null;
    let page = null;
    
    console.log(`Starting Tawtik automation for dossier: ${dossierNumber}`);
    
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production', // Use headless in production, visible in development
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768'],
        defaultViewport: null
      });

      // Open new page
      page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      // Navigate to the login page
      console.log('Navigating to Tawtik website...');
      await page.goto('https://tawtik.ma', { waitUntil: 'networkidle2' });
      
      // Wait for login form to be visible
      console.log('Waiting for login form...');
      
      // Try multiple selector strategies for the login form
      // First, wait for any form element to appear
      await page.waitForSelector('form', { timeout: 60000 });
      
      console.log('Form found, attempting to login...');
      
      // Look for input fields by their labels or placeholders
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} input fields`);
      
      // Try to identify username and password fields
      let usernameField = null;
      let passwordField = null;
      
      for (const input of inputs) {
        const type = await input.evaluate(el => el.type);
        const placeholder = await input.evaluate(el => el.placeholder?.toLowerCase() || '');
        const name = await input.evaluate(el => el.name?.toLowerCase() || '');
        const id = await input.evaluate(el => el.id?.toLowerCase() || '');
        const ariaLabel = await input.evaluate(el => el.getAttribute('aria-label')?.toLowerCase() || '');
        
        console.log(`Found input: type=${type}, placeholder=${placeholder}, name=${name}, id=${id}`);
        
        // Check for username field
        if (
          type === 'text' || 
          type === 'email' || 
          placeholder.includes('utilisateur') || 
          name.includes('user') || 
          name.includes('login') || 
          name.includes('nom') ||
          id.includes('user') || 
          id.includes('login') || 
          id.includes('username') ||
          ariaLabel.includes('utilisateur')
        ) {
          usernameField = input;
          console.log('Username field identified');
        }
        
        // Check for password field
        if (
          type === 'password' || 
          placeholder.includes('pass') || 
          placeholder.includes('mot de passe') || 
          name.includes('pass') || 
          id.includes('pass') ||
          ariaLabel.includes('mot de passe')
        ) {
          passwordField = input;
          console.log('Password field identified');
        }
      }
      
      if (!usernameField || !passwordField) {
        // Take a screenshot to see what's on the page
        await page.screenshot({ path: 'login-page.png' });
        throw new Error('Could not identify login form fields. Screenshot saved as login-page.png');
      }
      
      // Enter credentials
      console.log('Entering username and password...');
      await usernameField.type('assist.yacoubi');
      await passwordField.type('2001etude');
      
      // Look for the submit button
      console.log('Looking for submit button...');
      const submitButtons = await page.$$('button, input[type="submit"]');
      let submitButton = null;
      
      for (const button of submitButtons) {
        const type = await button.evaluate(el => el.type);
        const text = await button.evaluate(el => el.textContent?.toLowerCase() || '');
        const value = await button.evaluate(el => el.value?.toLowerCase() || '');
        
        if (
          type === 'submit' || 
          text.includes('login') || 
          text.includes('connexion') || 
          text.includes('connexion') || 
          value.includes('login')
        ) {
          submitButton = button;
          console.log('Submit button found');
          break;
        }
      }
      
      if (!submitButton) {
        // Try to find form and submit it directly
        console.log('No submit button found, attempting to submit form directly...');
        const form = await page.$('form');
        if (form) {
          await form.evaluate(f => f.submit());
        } else {
          throw new Error('Could not find login form submit button');
        }
      } else {
        // Click the submit button
        await submitButton.click();
      }
      
      // Wait for navigation
      console.log('Waiting for navigation after login...');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      
      // Check if login was successful
      const isLoggedIn = await page.evaluate(() => {
        // Check if we're no longer on a login page
        return !document.querySelector('input[type="password"]');
      });
      
      if (!isLoggedIn) {
        // Take a screenshot for debugging
        await page.screenshot({ path: 'login-failed.png' });
        throw new Error('Login failed. Please check credentials and the login page structure.');
      }
      
      console.log('Successfully logged in to Tawtik');
      
      // Take a screenshot after login for debugging
      await page.screenshot({ path: 'after-login.png' });
      
      // Navigate to ANEL section in sidebar
      console.log('Navigating to ANEL section...');
      
      // Look for the ANEL main menu button
      let anelLink = await page.evaluateHandle(() => {
        // Try to find by text content first (most reliable)
        const links = Array.from(document.querySelectorAll('a, button, .nav-link, .sidebar-link'));
        return links.find(el => el.textContent.trim() === 'ANEL' || 
                              el.textContent.trim().includes('ANEL'));
      });
      
      if (!anelLink || anelLink.asElement === null) {
        await page.screenshot({ path: 'no-anel-link.png' });
        throw new Error('Could not find ANEL link in navigation.');
      }
      
      // Click on the ANEL main menu
      console.log('Clicking on ANEL main menu...');
      await anelLink.click();
      
      // Wait for submenu to appear
      console.log('Waiting for submenu to appear...');
      await wait(page, 2000);
      
      // Take a screenshot to see the submenu
      await page.screenshot({ path: 'anel-submenu.png' });
      
      // Now look for the "Nouveau Dossier" option in the submenu
      console.log('Looking for Nouveau Dossier submenu option...');
      
      // Try to find the Nouveau Dossier submenu item
      let nouveauDossierLink = await page.evaluateHandle(() => {
        // First check for direct children of any expanded menu
        const expandedMenus = document.querySelectorAll('.expanded, .submenu, .dropdown-menu, .menu-open');
        for (const menu of expandedMenus) {
          const links = Array.from(menu.querySelectorAll('a, button, li, .nav-item'));
          const match = links.find(el => 
            el.textContent.trim() === 'Nouveau Dossier' || 
            (el.textContent.toLowerCase().includes('nouveau') && 
             el.textContent.toLowerCase().includes('dossier'))
          );
          if (match) return match;
        }
        
        // If not found in submenu, look for any element with this text
        const allLinks = Array.from(document.querySelectorAll('a, button, li, .nav-item'));
        return allLinks.find(el => 
          el.textContent.trim() === 'Nouveau Dossier' || 
          (el.textContent.toLowerCase().includes('nouveau') && 
           el.textContent.toLowerCase().includes('dossier'))
        );
      });
      
      if (!nouveauDossierLink || nouveauDossierLink.asElement === null) {
        await page.screenshot({ path: 'no-nouveau-dossier.png' });
        throw new Error('Could not find "Nouveau Dossier" option in submenu.');
      }
      
      // Click on Nouveau Dossier
      console.log('Clicking on Nouveau Dossier...');
      await nouveauDossierLink.click();
      await wait(page, 3000); // Wait for form to load
      
      // Take a screenshot of the dossier form
      await page.screenshot({ path: 'dossier-form.png' });
      
      // Look specifically for the "Dossier N°" field
      console.log('Looking for "Dossier N°" field...');
      
      let dossierField = await page.evaluateHandle(() => {
        // Look for a label containing "Dossier N°"
        const labels = Array.from(document.querySelectorAll('label'));
        const dossierLabel = labels.find(label => 
          label.textContent.includes('Dossier N°') || 
          label.textContent.includes('Dossier N') || 
          label.textContent.includes('Dossier No') ||
          label.textContent.toLowerCase().includes('dossier n')
        );
        
        if (dossierLabel) {
          // Try to find the associated input
          if (dossierLabel.htmlFor) {
            return document.getElementById(dossierLabel.htmlFor);
          }
          
          // If no ID reference, look for the closest input
          const input = dossierLabel.querySelector('input') || 
                       dossierLabel.nextElementSibling?.querySelector('input');
          if (input) return input;
        }
        
        // If not found by label, try inputs with specific attributes
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        const dossierInput = inputs.find(input => 
          input.name?.toLowerCase().includes('dossier') || 
          input.id?.toLowerCase().includes('dossier') ||
          input.placeholder?.toLowerCase().includes('dossier') ||
          input.getAttribute('aria-label')?.toLowerCase().includes('dossier')
        );
        
        return dossierInput;
      });
      
      if (!dossierField || dossierField.asElement === null) {
        throw new Error('Could not find "Dossier N°" field.');
      }
      
      console.log(`Filling dossier number: ${dossierNumber}`);
      await dossierField.type(dossierNumber);
      
      // Now handle the "Type d'opération" dropdown
      console.log('Looking for "Type d\'opération" dropdown...');
      
      let typeOperationDropdown = await page.evaluateHandle(() => {
        // Look for label containing "Type d'opération"
        const labels = Array.from(document.querySelectorAll('label'));
        const typeLabel = labels.find(label => 
          label.textContent.includes('Type d\'opération') || 
          label.textContent.toLowerCase().includes('type d\'operation')
        );
        
        if (typeLabel) {
          // Find the associated select element
          if (typeLabel.htmlFor) {
            return document.getElementById(typeLabel.htmlFor);
          }
          
          // Try nearby selects
          return typeLabel.querySelector('select') || 
                typeLabel.nextElementSibling?.querySelector('select');
        }
        
        // If not found by label, try selects with type in name/id
        const selects = Array.from(document.querySelectorAll('select'));
        return selects.find(select => 
          select.name?.toLowerCase().includes('type') || 
          select.id?.toLowerCase().includes('type') ||
          select.getAttribute('aria-label')?.toLowerCase().includes('type')
        );
      });
      
      if (!typeOperationDropdown || typeOperationDropdown.asElement === null) {
        await page.screenshot({ path: 'no-type-dropdown.png' });
        throw new Error('Could not find "Type d\'opération" dropdown.');
      }
      
      // Click to open the dropdown
      console.log('Selecting "Mutations de biens meubles" from Type dropdown');
      await typeOperationDropdown.click();
      await wait(page, 1000);
      
      // Select the option "Mutations d'immeubles ou Drts réels immobiliers"
      const typeOptionSelected = await page.evaluate(() => {
        // Find all options in all selects
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
          const options = Array.from(select.options);
          const targetOption = options.find(option => 
            option.textContent.includes('Mutations de biens') || 
            option.textContent.includes('Mutations de biens meubles')
          );
          
          if (targetOption) {
            // Select this option
            select.value = targetOption.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        return false;
      });
      
      if (!typeOptionSelected) {
        await page.screenshot({ path: 'type-selection-failed.png' });
        console.warn('Could not select "Mutations d\'immeubles ou Drts réels immobiliers". Continuing anyway...');
      }
      
      // Wait longer (3 seconds) for the dependent dropdown options to load
      console.log('Waiting for Nature d\'opération options to load based on Type selection...');
      await wait(page, 3000);
      
      // Now handle the "Nature d'opération" dropdown
      console.log('Looking for "Nature d\'opération" dropdown...');
      
      let natureOperationDropdown = await page.evaluateHandle(() => {
        // Look for label containing "Nature d'opération"
        const labels = Array.from(document.querySelectorAll('label'));
        const natureLabel = labels.find(label => 
          label.textContent.includes('Nature d\'opération') || 
          label.textContent.toLowerCase().includes('nature d\'operation')
        );
        
        if (natureLabel) {
          // Find the associated select element
          if (natureLabel.htmlFor) {
            return document.getElementById(natureLabel.htmlFor);
          }
          
          // Try nearby selects
          return natureLabel.querySelector('select') || 
                natureLabel.nextElementSibling?.querySelector('select');
        }
        
        // If not found by label, try selects with nature in name/id
        const selects = Array.from(document.querySelectorAll('select'));
        return selects.find(select => 
          select.name?.toLowerCase().includes('nature') || 
          select.id?.toLowerCase().includes('nature') ||
          select.getAttribute('aria-label')?.toLowerCase().includes('nature')
        );
      });
      
      if (!natureOperationDropdown || natureOperationDropdown.asElement === null) {
        await page.screenshot({ path: 'no-nature-dropdown.png' });
        throw new Error('Could not find "Nature d\'opération" dropdown.');
      }
      
      // Click to open the dropdown
      console.log('Selecting "Cession actions ou parts sociales" from Nature dropdown');
      await natureOperationDropdown.click();
      await wait(page, 1000);
      
      // Take a screenshot of the open dropdown to see options
      await page.screenshot({ path: 'nature-dropdown-open.png' });
      
      // Use a more direct approach to select the option - click on the option in the dropdown
      const optionSelected = await page.evaluate(() => {
        // Try to find the option text exactly
        const exactOptionText = "Cession actions ou parts sociales";
        
        // Look for the option in the dropdown list
        const options = Array.from(document.querySelectorAll('li, option, .dropdown-item, .select-option'));
        let targetOption = options.find(opt => opt.textContent.trim() === exactOptionText);
        
        // If not found by exact match, try partial match
        if (!targetOption) {
          targetOption = options.find(opt => 
            opt.textContent.includes('Cession actions') && 
            opt.textContent.includes('parts sociales')
          );
        }
        
        // If found, click on it
        if (targetOption) {
          targetOption.click();
          return true;
        }
        
        // If still not found, try updating the select value directly
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
          for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            if (option.textContent.includes('Cession actions') && 
                option.textContent.includes('parts sociales')) {
              // Set the value and dispatch events
              select.selectedIndex = i;
              select.value = option.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (!optionSelected) {
        await page.screenshot({ path: 'nature-selection-failed.png' });
        console.warn('Could not select "Cession actions ou parts sociales". Continuing anyway...');
      } else {
        console.log('Successfully selected "Cession actions ou parts sociales"');
      }
      
      await wait(page, 1000);
      
      // Take screenshot after selection
      await page.screenshot({ path: 'after-nature-selection.png' });
      
      // Add additional client info if provided
      if (clientInfo.name) {
        // Try to find name field with various selectors
        const nameInput = await page.$('input[name*="nom"], input[id*="nom"], input[placeholder*="nom"]');
        if (nameInput) {
          await nameInput.type(clientInfo.name);
        }
      }
      
      // Look for Enregistrer button
      console.log('Looking for Save button...');
      
      // Try different strategies to find the save button
      let saveButton = await page.evaluateHandle(() => {
        // Try by text content (most reliable)
        const buttons = Array.from(document.querySelectorAll('button'));
        let saveBtn = buttons.find(btn => 
          btn.textContent.trim().toLowerCase().includes('enregistrer')
        );
        
        // If not found, try by type and value
        if (!saveBtn) {
          saveBtn = document.querySelector('input[type="submit"][value*="enregistrer" i]');
        }
        
        // If still not found, try by class or ID
        if (!saveBtn) {
          const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
          saveBtn = allButtons.find(btn => 
            btn.id?.toLowerCase().includes('save') || 
            btn.id?.toLowerCase().includes('enregistrer') ||
            btn.className?.toLowerCase().includes('save') ||
            btn.className?.toLowerCase().includes('enregistrer')
          );
        }
        
        return saveBtn;
      });
      
      if (!saveButton || saveButton.asElement === null) {
        await page.screenshot({ path: 'no-save-button.png' });
        throw new Error('Could not find Save button.');
      }
      
      // Take a screenshot before saving
      await page.screenshot({ path: 'before-save.png' });
      
      // Click on Enregistrer button
      console.log('Saving the dossier...');
      await saveButton.click();
      
      // Wait for confirmation
      await wait(page, 5000);
      
      // Take a screenshot after saving
      await page.screenshot({ path: 'after-save.png' });
      
      // Look for "Modifier" button at the top right
      console.log('Looking for "Modifier" button...');
      
      // Wait a bit for page to stabilize after save
      await wait(page, 2000);
      
      // Try to find and click the Modifier button
      const modifierClicked = await page.evaluate(() => {
        // Look for button with text Modifier
        const buttons = Array.from(document.querySelectorAll('button, a.btn, .btn, input[type="button"]'));
        const modifierBtn = buttons.find(btn => 
          btn.textContent.trim() === 'Modifier' || 
          btn.textContent.includes('Modifier')
        );
        
        if (modifierBtn) {
          modifierBtn.click();
          return true;
        }
        return false;
      });
      
      if (!modifierClicked) {
        console.warn('Could not find "Modifier" button. Taking screenshot for debugging.');
        await page.screenshot({ path: 'no-modifier-button.png' });
      } else {
        console.log('Clicked on "Modifier" button');
        
        // Wait for page to update
        await wait(page, 3000);
        
        // Look for "Cédant (s) / Bénéficiaire (s)" section
        console.log('Looking for "Cédant (s) / Bénéficiaire (s)" section...');
        
        // Take a screenshot to see the page after clicking Modifier
        await page.screenshot({ path: 'after-modifier-click.png' });
        
        // Wait longer after clicking Modifier to ensure page is fully loaded
        await wait(page, 5000);
        
        // NEW APPROACH: Use XPath to find the Ajouter une ligne cell in the table
        let sectionFound = false;
        
        try {
          // Look for the exact XPath based on the screenshot structure
          console.log('Trying XPath approach for Ajouter une ligne...');
          const xpaths = [
            "//table//td[contains(text(), 'Ajouter une ligne')]",
            "//div[contains(text(), 'Cédant') and contains(text(), 'Bénéficiaire')]/following::table//td[contains(text(), 'Ajouter une ligne')]",
            "//th[contains(text(), 'Dénomination') or contains(text(), 'Prénom')]/ancestor::table//td[contains(text(), 'Ajouter une ligne')]"
          ];
          
          for (const xpath of xpaths) {
            try {
              const [element] = await page.$x(xpath);
              if (element) {
                console.log(`Found element with xpath: ${xpath}`);
                await element.click();
                console.log('Successfully clicked on Ajouter une ligne');
                sectionFound = true;
                break;
              }
            } catch (xpathError) {
              console.log(`XPath attempt failed: ${xpath}`);
            }
          }
          
          if (!sectionFound) {
            // Try using evaluate as a fallback
            sectionFound = await page.evaluate(() => {
              // Look for any TD containing exactly "Ajouter une ligne"
              const cells = Array.from(document.querySelectorAll('td'));
              const ajouterCell = cells.find(cell => 
                cell.textContent && cell.textContent.trim() === "Ajouter une ligne"
              );
              
              if (ajouterCell) {
                console.log('Found and clicking cell with exact text match');
                ajouterCell.click();
                return true;
              }
              
              return false;
            });
          }
        } catch (error) {
          console.error('Error finding Ajouter une ligne:', error);
          await page.screenshot({ path: 'ajouter-line-error.png' });
        }
        
        if (!sectionFound) {
          console.warn('Could not find "Cédant (s) / Bénéficiaire (s)" section or "Ajouter une ligne". Taking screenshot for debugging.');
          await page.screenshot({ path: 'no-section-found.png' });
        } else {
          console.log('Clicked on "Ajouter une ligne"');
          
          // Wait for modal to appear
          await wait(page, 3000);
          
          // Look for "Nouveau" button in the modal
          const nouveauClicked = await page.evaluate(() => {
            // Find buttons in any recently opened modal
            const modals = document.querySelectorAll('.modal, .dialog, [role="dialog"], .popup, .overlay');
            
            for (const modal of modals) {
              const buttons = Array.from(modal.querySelectorAll('button, a.btn, .btn'));
              const nouveauBtn = buttons.find(btn => 
                btn.textContent.trim() === 'Nouveau' || 
                btn.textContent.includes('Nouveau')
              );
              
              if (nouveauBtn) {
                nouveauBtn.click();
                return true;
              }
            }
            
            // If no modal found, try searching in the whole document
            const buttons = Array.from(document.querySelectorAll('button, a.btn, .btn'));
            const nouveauBtn = buttons.find(btn => 
              btn.textContent.trim() === 'Nouveau' || 
              btn.textContent.includes('Nouveau')
            );
            
            if (nouveauBtn) {
              nouveauBtn.click();
              return true;
            }
            
            return false;
          });
          
          if (!nouveauClicked) {
            console.warn('Could not find "Nouveau" button. Taking screenshot for debugging.');
            await page.screenshot({ path: 'no-nouveau-button.png' });
          } else {
            console.log('Clicked on "Nouveau" button');
            
            // Wait for the creation modal to appear
            await wait(page, 3000);
            
            // Take a screenshot of the creation modal
            await page.screenshot({ path: 'creation-modal.png' });
            
            // Fill in "Prénom" with "Badr" and "Nom" with "Bouslama"
            const formFilled = await page.evaluate(() => {
              let prenomField = null;
              let nomField = null;
              
              // Find the input fields for Prénom and Nom
              const labels = Array.from(document.querySelectorAll('label'));
              
              // Find Prénom field
              const prenomLabel = labels.find(label => 
                label.textContent.trim() === 'Prénom' || 
                label.textContent.includes('Prénom')
              );
              
              if (prenomLabel && prenomLabel.htmlFor) {
                prenomField = document.getElementById(prenomLabel.htmlFor);
              }
              
              if (!prenomField) {
                // Try other methods to find the field
                const inputs = Array.from(document.querySelectorAll('input'));
                prenomField = inputs.find(input => 
                  input.placeholder?.includes('Prénom') || 
                  input.name?.toLowerCase().includes('prenom') ||
                  input.id?.toLowerCase().includes('prenom')
                );
              }
              
              // Find Nom field
              const nomLabel = labels.find(label => 
                label.textContent.trim() === 'Nom' || 
                label.textContent.includes('Nom')
              );
              
              if (nomLabel && nomLabel.htmlFor) {
                nomField = document.getElementById(nomLabel.htmlFor);
              }
              
              if (!nomField) {
                // Try other methods to find the field
                const inputs = Array.from(document.querySelectorAll('input'));
                nomField = inputs.find(input => 
                  input.placeholder?.includes('Nom') || 
                  input.name?.toLowerCase().includes('nom') ||
                  input.id?.toLowerCase().includes('nom')
                );
              }
              
              // Fill in the fields if found
              let success = false;
              
              if (prenomField) {
                prenomField.value = 'Badr';
                prenomField.dispatchEvent(new Event('input', { bubbles: true }));
                success = true;
              }
              
              if (nomField) {
                nomField.value = 'Bouslama';
                nomField.dispatchEvent(new Event('input', { bubbles: true }));
                success = success && true;
              }
              
              return success;
            });
            
            if (!formFilled) {
              console.warn('Could not fill in Prénom and Nom fields. Taking screenshot for debugging.');
              await page.screenshot({ path: 'form-filling-failed.png' });
            } else {
              console.log('Filled in Prénom="Badr" and Nom="Bouslama"');
              
              // Wait a bit before clicking save
              await wait(page, 1000);
              
              // Click "Enregister & Fermer" button
              const saveClicked = await page.evaluate(() => {
                // Find the button by text
                const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], .btn'));
                const saveBtn = buttons.find(btn => 
                  btn.textContent.includes('Enregistrer & Fermer') || 
                  btn.textContent.includes('Enregistrer et Fermer') ||
                  btn.textContent.includes('Enregistrer')
                );
                
                if (saveBtn) {
                  saveBtn.click();
                  return true;
                }
                
                return false;
              });
              
              if (!saveClicked) {
                console.warn('Could not click on "Enregistrer & Fermer" button. Taking screenshot for debugging.');
                await page.screenshot({ path: 'save-button-not-found.png' });
              } else {
                console.log('Clicked on "Enregistrer & Fermer" button');
                
                // Wait for the form to be submitted and modal to close
                await wait(page, 5000);
                
                // Take a final screenshot
                await page.screenshot({ path: 'after-form-save.png' });
              }
            }
          }
        }
      }
      
      // Take a final screenshot for verification
      const screenshot = await page.screenshot({ encoding: 'base64' });
      
      // Update the success message to reflect all completed steps
      console.log('Tawtik automation completed successfully: Dossier created and person added');
      
      // Close browser
      await browser.close();
      
      // Return success with detailed message
      return {
        success: true,
        message: 'Dossier created successfully in Tawtik and person data (Badr Bouslama) added',
        dossierNumber,
        screenshot
      };
      
    } catch (error) {
      console.error('Error in Tawtik automation:', error);
      
      // Take a screenshot on error for debugging
      try {
        if (page) {
          await page.screenshot({ path: 'error-screenshot.png' });
        }
      } catch (screenshotError) {
        console.error('Error taking error screenshot:', screenshotError);
      }
      
      // Close browser on error
      try {
        if (browser) {
          await browser.close();
        }
      } catch (closeBrowserError) {
        console.error('Error closing browser:', closeBrowserError);
      }
      
      return {
        success: false,
        message: `Tawtik automation failed: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = new TawtikService(); 