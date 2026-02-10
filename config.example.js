// Example configuration file for the deployment pipeline
// This shows how to customize the pipeline for your needs

var path = require('path');

// Basic configuration
var config = {
    // Project root directory
    projectPath: process.cwd(),
    
    // Where to build the project
    buildPath: path.join(process.cwd(), 'build'),
    
    // Where to deploy the built project
    deployPath: path.join(process.cwd(), 'deployed'),
    
    // Log file location
    logFile: path.join(process.cwd(), 'deployment.log')
};

// Export configuration
module.exports = config;
