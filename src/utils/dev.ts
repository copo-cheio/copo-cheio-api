import fs from 'fs';
export const debugLogger = (name?: string) => {
  name = 'Log::[' + name + ']';
  let i = 0;

  return {
    log(data: any = '') {
      ++i;
      console.log(name, i, data);
    },
  };
};

export const logRequest = (
  fileName: string = 'requests',
  request: any = {},
  body?: any,
) => {
  const logEntry: any = {
    method: request.method,
    url: request.url,
    query: request.query,
    cookies: request.headers.cookie || 'No cookies',
    timestamp: new Date().toISOString(),
  };
  if (body) {
    logEntry.body = body;
  }

  console.log({logEntry});

  fs.appendFileSync(
    fileName + '.log',
    JSON.stringify(logEntry, null, 2) + '\n',
  );
  return {message: 'Logged GET request', data: logEntry};
};
