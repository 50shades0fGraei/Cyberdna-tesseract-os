const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonBridge {
  constructor() {
    this.process = null;
    this.queue = [];
    this.ready = false;
  }

  async init() {
    return new Promise((resolve, reject) => {
      // Determine Python executable path
      const pythonExe = this.getPythonPath();

      // Start Python subprocess
      this.process = spawn(pythonExe, [
        path.join(__dirname, '../python/host.py'),
      ]);

      this.process.stdout.on('data', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'ready') {
            this.ready = true;
            resolve();
          } else if (message.type === 'response') {
            // Handle response from queue
            const callback = this.queue.shift();
            if (callback) callback(null, message.data);
          }
        } catch (err) {
          console.error('Error parsing Python message:', err);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
      });

      this.process.on('error', (err) => {
        reject(err);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.ready) {
          reject(new Error('Python process initialization timeout'));
        }
      }, 10000);
    });
  }

  getPythonPath() {
    // Try common Python locations
    const candidates = [
      process.env.PYTHON_PATH,
      'python3',
      'python',
      path.join(process.resourcesPath, 'python', 'python.exe'),
    ];

    for (const candidate of candidates) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return 'python3'; // Fallback
  }

  callSync(method, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error('Python bridge not ready'));
        return;
      }

      this.queue.push((err, result) => {
        if (err) reject(err);
        else resolve(result);
      });

      const request = {
        method,
        args,
      };

      this.process.stdin.write(JSON.stringify(request) + '\n');

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error(`Python method ${method} timed out`));
      }, 30000);
    });
  }

  destroy() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

module.exports = { PythonBridge };
