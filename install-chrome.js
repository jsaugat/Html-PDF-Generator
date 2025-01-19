import { exec } from 'child_process';

// This script installs Chrome in the Render environment
const installChrome = () => {
  const commands = [
    // Add Chrome's repository
    'wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -',
    'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list',

    // Update package list and install Chrome
    'apt-get update',
    'apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends'
  ];

  for (const command of commands) {
    try {
      exec(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to execute command: ${command}`, error);
      process.exit(1);
    }
  }
};

installChrome();