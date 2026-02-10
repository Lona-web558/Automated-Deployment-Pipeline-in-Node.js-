// Automated Deployment Pipeline
// Traditional JavaScript (ES5 style) - No arrow functions, using var

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Utility function for logging
function log(message, type) {
    var timestamp = new Date().toISOString();
    var prefix = '[' + timestamp + '] ';
    
    switch(type) {
        case 'error':
            console.error(prefix + '❌ ERROR: ' + message);
            break;
        case 'success':
            console.log(prefix + '✅ SUCCESS: ' + message);
            break;
        case 'info':
            console.log(prefix + 'ℹ️  INFO: ' + message);
            break;
        default:
            console.log(prefix + message);
    }
}

// Deployment Pipeline Constructor
function DeploymentPipeline(config) {
    EventEmitter.call(this);
    
    this.config = config || {};
    this.projectPath = this.config.projectPath || process.cwd();
    this.buildPath = this.config.buildPath || path.join(this.projectPath, 'build');
    this.deployPath = this.config.deployPath || path.join(this.projectPath, 'deployed');
    this.logFile = this.config.logFile || path.join(this.projectPath, 'deployment.log');
    this.stages = [];
    this.currentStage = 0;
}

// Inherit from EventEmitter
util.inherits(DeploymentPipeline, EventEmitter);

// Add a stage to the pipeline
DeploymentPipeline.prototype.addStage = function(name, handler) {
    this.stages.push({
        name: name,
        handler: handler
    });
    return this;
};

// Execute a shell command
DeploymentPipeline.prototype.executeCommand = function(command, callback) {
    var self = this;
    log('Executing: ' + command, 'info');
    
    child_process.exec(command, { cwd: this.projectPath }, function(error, stdout, stderr) {
        if (error) {
            log('Command failed: ' + error.message, 'error');
            callback(error);
            return;
        }
        
        if (stderr) {
            log('Command stderr: ' + stderr);
        }
        
        if (stdout) {
            log('Command stdout: ' + stdout);
        }
        
        callback(null, stdout);
    });
};

// Write to log file
DeploymentPipeline.prototype.writeLog = function(message) {
    var timestamp = new Date().toISOString();
    var logMessage = '[' + timestamp + '] ' + message + '\n';
    
    fs.appendFileSync(this.logFile, logMessage);
};

// Run all stages
DeploymentPipeline.prototype.run = function(callback) {
    var self = this;
    
    log('Starting deployment pipeline...', 'info');
    self.writeLog('Deployment pipeline started');
    self.emit('start');
    
    function runNextStage() {
        if (self.currentStage >= self.stages.length) {
            log('All stages completed successfully!', 'success');
            self.writeLog('Deployment pipeline completed successfully');
            self.emit('complete');
            if (callback) callback(null);
            return;
        }
        
        var stage = self.stages[self.currentStage];
        log('Running stage: ' + stage.name, 'info');
        self.writeLog('Stage started: ' + stage.name);
        self.emit('stage', stage.name);
        
        stage.handler.call(self, function(error) {
            if (error) {
                log('Stage failed: ' + stage.name, 'error');
                self.writeLog('Stage failed: ' + stage.name + ' - ' + error.message);
                self.emit('error', error);
                if (callback) callback(error);
                return;
            }
            
            log('Stage completed: ' + stage.name, 'success');
            self.writeLog('Stage completed: ' + stage.name);
            self.currentStage++;
            
            // Run next stage after a small delay
            setTimeout(runNextStage, 500);
        });
    }
    
    runNextStage();
};

// Create default deployment pipeline
function createDefaultPipeline(config) {
    var pipeline = new DeploymentPipeline(config);
    
    // Stage 1: Pre-deployment checks
    pipeline.addStage('Pre-deployment Checks', function(callback) {
        var self = this;
        log('Checking project directory: ' + self.projectPath);
        
        fs.access(self.projectPath, fs.constants.R_OK | fs.constants.W_OK, function(error) {
            if (error) {
                callback(new Error('Project directory not accessible'));
                return;
            }
            
            log('Project directory is accessible');
            callback(null);
        });
    });
    
    // Stage 2: Clean old builds
    pipeline.addStage('Clean Build Directory', function(callback) {
        var self = this;
        
        if (fs.existsSync(self.buildPath)) {
            log('Removing old build directory...');
            self.executeCommand('rm -rf ' + self.buildPath, function(error) {
                if (error) {
                    callback(error);
                    return;
                }
                log('Old build directory removed');
                callback(null);
            });
        } else {
            log('No old build directory to clean');
            callback(null);
        }
    });
    
    // Stage 3: Create build directory
    pipeline.addStage('Create Build Directory', function(callback) {
        var self = this;
        
        fs.mkdir(self.buildPath, { recursive: true }, function(error) {
            if (error) {
                callback(error);
                return;
            }
            
            log('Build directory created: ' + self.buildPath);
            callback(null);
        });
    });
    
    // Stage 4: Run tests
    pipeline.addStage('Run Tests', function(callback) {
        var self = this;
        log('Running tests...');
        
        // Simulate test execution
        setTimeout(function() {
            log('All tests passed');
            callback(null);
        }, 1000);
    });
    
    // Stage 5: Build project
    pipeline.addStage('Build Project', function(callback) {
        var self = this;
        log('Building project...');
        
        // Create a sample build file
        var buildContent = '// Built on ' + new Date().toISOString() + '\n';
        buildContent += 'module.exports = { version: "1.0.0", built: true };';
        
        var buildFile = path.join(self.buildPath, 'index.js');
        
        fs.writeFile(buildFile, buildContent, function(error) {
            if (error) {
                callback(error);
                return;
            }
            
            log('Project built successfully');
            callback(null);
        });
    });
    
    // Stage 6: Create deployment package
    pipeline.addStage('Create Deployment Package', function(callback) {
        var self = this;
        log('Creating deployment package...');
        
        // Create package info
        var packageInfo = {
            name: 'deployment-package',
            version: '1.0.0',
            deploymentDate: new Date().toISOString(),
            files: []
        };
        
        // Read build directory
        fs.readdir(self.buildPath, function(error, files) {
            if (error) {
                callback(error);
                return;
            }
            
            packageInfo.files = files;
            
            var packageFile = path.join(self.buildPath, 'package-info.json');
            fs.writeFile(packageFile, JSON.stringify(packageInfo, null, 2), function(error) {
                if (error) {
                    callback(error);
                    return;
                }
                
                log('Deployment package created');
                callback(null);
            });
        });
    });
    
    // Stage 7: Deploy to target directory
    pipeline.addStage('Deploy to Target', function(callback) {
        var self = this;
        log('Deploying to: ' + self.deployPath);
        
        // Create deploy directory if it doesn't exist
        fs.mkdir(self.deployPath, { recursive: true }, function(error) {
            if (error) {
                callback(error);
                return;
            }
            
            // Copy build files to deploy directory
            self.executeCommand('cp -r ' + self.buildPath + '/* ' + self.deployPath, function(error) {
                if (error) {
                    callback(error);
                    return;
                }
                
                log('Deployment completed successfully');
                callback(null);
            });
        });
    });
    
    // Stage 8: Post-deployment verification
    pipeline.addStage('Post-deployment Verification', function(callback) {
        var self = this;
        log('Verifying deployment...');
        
        var deployedPackageFile = path.join(self.deployPath, 'package-info.json');
        
        fs.readFile(deployedPackageFile, 'utf8', function(error, data) {
            if (error) {
                callback(new Error('Deployment verification failed: package-info.json not found'));
                return;
            }
            
            try {
                var packageInfo = JSON.parse(data);
                log('Deployed version: ' + packageInfo.version);
                log('Deployment verified successfully');
                callback(null);
            } catch (parseError) {
                callback(parseError);
            }
        });
    });
    
    return pipeline;
}

// Main execution
function main() {
    log('=== Automated Deployment Pipeline ===', 'info');
    
    var config = {
        projectPath: process.cwd(),
        buildPath: path.join(process.cwd(), 'build'),
        deployPath: path.join(process.cwd(), 'deployed'),
        logFile: path.join(process.cwd(), 'deployment.log')
    };
    
    var pipeline = createDefaultPipeline(config);
    
    // Event listeners
    pipeline.on('start', function() {
        log('Pipeline started', 'info');
    });
    
    pipeline.on('stage', function(stageName) {
        log('Current stage: ' + stageName, 'info');
    });
    
    pipeline.on('complete', function() {
        log('Pipeline completed!', 'success');
        log('Build location: ' + config.buildPath);
        log('Deploy location: ' + config.deployPath);
        log('Log file: ' + config.logFile);
    });
    
    pipeline.on('error', function(error) {
        log('Pipeline error: ' + error.message, 'error');
        process.exit(1);
    });
    
    // Run the pipeline
    pipeline.run(function(error) {
        if (error) {
            log('Deployment failed!', 'error');
            process.exit(1);
        } else {
            log('Deployment pipeline finished successfully!', 'success');
            process.exit(0);
        }
    });
}

// Export for use as a module
module.exports = {
    DeploymentPipeline: DeploymentPipeline,
    createDefaultPipeline: createDefaultPipeline
};

// Run if executed directly
if (require.main === module) {
    main();
}
