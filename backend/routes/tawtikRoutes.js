const express = require('express');
const router = express.Router();
const tawtikService = require('../services/tawtik/tawtikService');

/**
 * @route   POST /api/tawtik/create-file
 * @desc    Create a new file in Tawtik system
 * @access  Private
 */
router.post('/create-file', async (req, res) => {
  console.log('Backend API: Received Tawtik file creation request', req.body);
  
  try {
    const { clientId, dossierNumber, clientInfo } = req.body;
    
    if (!dossierNumber) {
      console.log('Backend API: Missing dossier number');
      return res.status(400).json({ 
        success: false, 
        message: 'Dossier number is required' 
      });
    }
    
    // Call the Tawtik service to create the file
    console.log(`Backend API: Starting Tawtik automation for dossier ${dossierNumber} and adding person data`);
    const result = await tawtikService.createNewFile({
      dossierNumber,
      clientInfo: clientInfo || {}
    });
    
    console.log('Backend API: Tawtik automation completed with result:', { 
      success: result.success, 
      message: result.message 
    });
    
    // Return the result
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Backend API: Error in create-file route:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Tawtik file creation',
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router; 