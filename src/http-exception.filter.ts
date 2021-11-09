import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import { errorMessage } from './response-messages';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errResponse = exception.getResponse();
    const lastURL = path.basename(request.url).split('?')[0];
    const customMessage = errorMessage[lastURL]
      ? errorMessage[lastURL][status]
      : undefined;

    return customMessage == null
      ? response.status(status).json(errResponse)
      : response.status(status).json({
          statusCode: status,
          errorMessage: customMessage,
          //timestamp: new Date(Date.now()).toString(),
          path: request.url,
        });
  }
}
