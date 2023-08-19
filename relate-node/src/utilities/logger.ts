import { Request } from 'express';
import winston from 'winston';
import morgan from 'morgan';

const winstonTransports: winston.transports.ConsoleTransportInstance[] = [
  new winston.transports.Console({
    level: 'info',
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'MM/DD/YY HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.json(),
      winston.format.printf((info) => {
        if (info.req?.user) {
          const userId = <string>info.req.user;
          return `${info.level}: [${info.timestamp}, ${userId}] ${info.message}`;
        }
        return `${info.level}: [${info.timestamp}] ${info.message}`;
      })
    ),
  }),
];

export const logger = winston.createLogger({
  level: 'info',
  transports: winstonTransports,
  exitOnError: false,
});

class LoggerStream {
  write(message: string) {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  }
}

// Custom token that looks to log the body of the HTTP request.
morgan.token('req_body', (req: Request) => {
  delete req.body.password;
  return `${JSON.stringify(req.body)}`;
});

// Controlls the format of Morgan logs.
const morganFormatFunction: morgan.FormatFn = (tokens, req, res): string =>
  [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    '|',
    tokens.req_body(req, res),
  ].join(' ');

export const morganMiddleware = morgan(morganFormatFunction, {
  stream: new LoggerStream(),
});
