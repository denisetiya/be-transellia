type LogLevel = 'info' | 'warn' | 'error';

// ANSI Color Codes
const colors = {
  // Reset
  reset: '\x1b[0m',
  
  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Backgrounds
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

const log = (level: LogLevel, message: string): void => {
  const timestamp = new Date().toISOString();
  const name = 'App';
  
  switch (level) {
    case 'info':
      console.log(
        `${colors.gray}[${timestamp}]${colors.reset}` +
        `${colors.blue} [INFO]${colors.reset}` +
        `${colors.cyan} [${name}]${colors.reset}` +
        ` ${message}`
      );
      break;
    case 'warn':
      console.log(
        `${colors.gray}[${timestamp}]${colors.reset}` +
        `${colors.yellow}${colors.bold} [WARN]${colors.reset}` +
        `${colors.cyan} [${name}]${colors.reset}` +
        ` ${message}`
      );
      break;
    case 'error':
      console.log(
        `${colors.gray}[${timestamp}]${colors.reset}` +
        `${colors.red}${colors.bold} [ERROR]${colors.reset}` +
        `${colors.cyan} [${name}]${colors.reset}` +
        ` ${message}`
      );
      break;
  }
};

const logger = {
  info: (message: string) => log('info', message),
  warn: (message: string) => log('warn', message),
  error: (message: string) => log('error', message)
};

export default logger;