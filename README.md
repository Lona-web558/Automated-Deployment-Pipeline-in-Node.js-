# Automated-Deployment-Pipeline-in-Node.js-
Automated Deployment Pipeline in Node.js 

# Automated Deployment Pipeline

A Node.js automated deployment pipeline written in traditional JavaScript (ES5 style) with no arrow functions, using `var` declarations only, and basic Node.js modules.

## Features

- **Pre-deployment checks** - Validates project directory accessibility
- **Build directory management** - Cleans and creates build directories
- **Automated testing** - Runs test suite before deployment
- **Project building** - Compiles and packages your project
- **Deployment packaging** - Creates deployment artifacts
- **Target deployment** - Deploys to specified directory
- **Post-deployment verification** - Verifies successful deployment
- **Event-driven architecture** - Uses EventEmitter for pipeline events
- **Detailed logging** - Logs all operations to file and console

## Usage

### Run the pipeline

```bash
node deployment-pipeline.js
```

### Use as a module

```javascript
var pipeline = require('./deployment-pipeline');

var config = {
    projectPath: '/path/to/your/project',
    buildPath: '/path/to/build',
    deployPath: '/path/to/deploy',
    logFile: '/path/to/deployment.log'
};

var myPipeline = pipeline.createDefaultPipeline(config);

myPipeline.run(function(error) {
    if (error) {
        console.error('Deployment failed:', error);
    } else {
        console.log('Deployment succeeded!');
    }
});
```

### Create custom pipeline

```javascript
var DeploymentPipeline = require('./deployment-pipeline').DeploymentPipeline;

var customPipeline = new DeploymentPipeline({
    projectPath: process.cwd()
});

// Add custom stages
customPipeline.addStage('Custom Stage', function(callback) {
    console.log('Running custom stage');
    // Your custom logic here
    callback(null);
});

customPipeline.run(function(error) {
    if (error) {
        console.error('Failed:', error);
    }
});
```

## Pipeline Stages

1. **Pre-deployment Checks** - Validates environment
2. **Clean Build Directory** - Removes old builds
3. **Create Build Directory** - Prepares build location
4. **Run Tests** - Executes test suite
5. **Build Project** - Compiles project files
6. **Create Deployment Package** - Packages artifacts
7. **Deploy to Target** - Copies to deployment directory
8. **Post-deployment Verification** - Confirms success

## Events

The pipeline emits the following events:

- `start` - Pipeline execution begins
- `stage` - Each stage starts (provides stage name)
- `complete` - Pipeline completes successfully
- `error` - Pipeline encounters an error

## Output

- **Build directory**: `./build/` - Contains compiled files
- **Deploy directory**: `./deployed/` - Contains deployed files
- **Log file**: `./deployment.log` - Detailed execution log

## Requirements

- Node.js (v6.0 or higher)
- Unix-based system (for shell commands like rm, cp)

## Technical Details

- Written in traditional JavaScript (ES5)
- No arrow functions
- Uses `var` instead of `const` or `let`
- Uses basic Node.js modules only (fs, path, child_process, util, events)
- No external dependencies
- No Express or web server
- No localhost running

## License

MIT

