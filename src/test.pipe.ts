import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TestPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('TestPipe 호출');
    return value;
  }
}
