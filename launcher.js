#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class CyanLauncher {
    constructor() {
        this.port = 8000;
        this.serverProcess = null;
        this.projectPath = process.cwd();
    }

    log(message, color = 'white') {
        const colors = {
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            cyan: '\x1b[36m',
            white: '\x1b[37m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async checkNodeJs() {
        return new Promise((resolve) => {
            exec('node --version', (error, stdout) => {
                if (error) {
                    this.log('❌ Error: Node.js is not installed or not in PATH', 'red');
                    this.log('Please install Node.js from https://nodejs.org/', 'yellow');
                    resolve(false);
                } else {
                    this.log(`✓ Node.js found: ${stdout.trim()}`, 'green');
                    resolve(true);
                }
            });
        });
    }

    async checkDependencies() {
        if (!fs.existsSync(path.join(this.projectPath, 'package.json'))) {
            this.log('❌ Error: package.json not found', 'red');
            this.log('Please run this from the Cyan orchestrator directory', 'yellow');
            return false;
        }

        if (!fs.existsSync(path.join(this.projectPath, 'node_modules'))) {
            this.log('📦 Installing dependencies...', 'yellow');
            return this.installDependencies();
        }
        
        this.log('✓ Dependencies found', 'green');
        return true;
    }

    async installDependencies() {
        return new Promise((resolve) => {
            const npm = spawn('npm', ['install'], { 
                cwd: this.projectPath,
                stdio: 'inherit'
            });

            npm.on('close', (code) => {
                if (code === 0) {
                    this.log('✓ Dependencies installed successfully', 'green');
                    resolve(true);
                } else {
                    this.log('❌ Error: Failed to install dependencies', 'red');
                    resolve(false);
                }
            });
        });
    }

    async startServer() {
        this.log(`🖥️  Starting Cyan development server on port ${this.port}...`, 'blue');
        this.log(`Server will be available at: http://localhost:${this.port}`, 'cyan');

        return new Promise((resolve) => {
            this.serverProcess = spawn('npm', ['run', 'dev'], {
                cwd: this.projectPath,
                stdio: 'pipe'
            });

            this.serverProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Ready in') || output.includes('Local:')) {
                    resolve(true);
                }
                // Optionally log server output
                // console.log(output);
            });

            this.serverProcess.stderr.on('data', (data) => {
                const error = data.toString();
                if (error.includes('Error:')) {
                    this.log(`Server error: ${error}`, 'red');
                }
            });

            this.serverProcess.on('close', (code) => {
                if (code !== 0) {
                    this.log('❌ Server stopped unexpectedly', 'red');
                }
            });

            // Timeout fallback
            setTimeout(() => resolve(true), 10000);
        });
    }

    findAvastBrowser() {
        const possiblePaths = [
            'C:\\Program Files\\AVAST Software\\Browser\\Application\\AvastBrowser.exe',
            'C:\\Program Files (x86)\\AVAST Software\\Browser\\Application\\AvastBrowser.exe',
            path.join(os.homedir(), 'AppData', 'Local', 'AVAST Software', 'Browser', 'Application', 'AvastBrowser.exe')
        ];

        for (const browserPath of possiblePaths) {
            if (fs.existsSync(browserPath)) {
                return browserPath;
            }
        }
        return null;
    }

    async openBrowser() {
        this.log('🌐 Opening Cyan in browser...', 'blue');
        
        const url = `http://localhost:${this.port}`;
        const avastPath = this.findAvastBrowser();

        if (avastPath) {
            this.log('✓ Opening in Avast Secure Browser...', 'green');
            spawn(avastPath, [url], { detached: true });
        } else {
            this.log('⚠️  Avast Secure Browser not found, opening in default browser...', 'yellow');
            
            // Open in default browser based on OS
            const platform = os.platform();
            let command;
            
            if (platform === 'win32') {
                command = `start ${url}`;
            } else if (platform === 'darwin') {
                command = `open ${url}`;
            } else {
                command = `xdg-open ${url}`;
            }
            
            exec(command);
        }
    }

    setupGracefulShutdown() {
        const cleanup = () => {
            if (this.serverProcess) {
                this.log('🔴 Stopping Cyan Orchestrator...', 'yellow');
                this.serverProcess.kill('SIGTERM');
                this.serverProcess = null;
            }
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }

    async run() {
        this.log('🚀 Starting Cyan Orchestrator...', 'cyan');
        console.log('');

        // Check prerequisites
        if (!(await this.checkNodeJs())) {
            process.exit(1);
        }

        if (!(await this.checkDependencies())) {
            process.exit(1);
        }

        // Start server
        this.log('⏳ Starting server...', 'yellow');
        await this.startServer();

        // Wait a bit more for server to be fully ready
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Open browser
        await this.openBrowser();

        // Setup cleanup
        this.setupGracefulShutdown();

        // Success message
        console.log('');
        this.log('🎉 Cyan Orchestrator is now running!', 'green');
        console.log('');
        this.log(`📍 Web interface: http://localhost:${this.port}`, 'cyan');
        this.log('🛑 To stop the server: Close this window or press Ctrl+C', 'white');
        console.log('');
        this.log('Keep this window open to keep Cyan running...', 'yellow');
        console.log('');

        // Keep alive and show status
        setInterval(() => {
            const timestamp = new Date().toLocaleString();
            this.log(`[${timestamp}] ✓ Cyan is running at http://localhost:${this.port}`, 'green');
        }, 60000);
    }
}

// Run the launcher
if (require.main === module) {
    const launcher = new CyanLauncher();
    launcher.run().catch(error => {
        console.error('❌ Error starting Cyan:', error);
        process.exit(1);
    });
}

module.exports = CyanLauncher;
