import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message =
          'Unique constraint failed (e.g., duplicate unique field value)';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      default:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
    }

    res.status(status).json({
      statusCode: status,
      message,
      prismaCode: exception.code,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
