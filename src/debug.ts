/**
 * Ensure this runs only once
 */

let memoryCheckInterval: NodeJS.Timeout | null = null;
export function debugMemoryLeaks() {
  // Clear any existing interval to prevent duplicates
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    console.log('Cleared previous memory check interval.');
  }

  // Start new memory logging interval
  memoryCheckInterval = setInterval(() => {
    console.log('Ping memory:');
    console.log(process.memoryUsage());
  }, 10 * 60000); // Logs every 10 minutes

  console.log('Memory check interval started.');
}
