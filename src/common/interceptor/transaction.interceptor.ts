import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, observable, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    // 트랜잭션과 관련된 모든 쿼리를 담당할
    // 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();

    // 쿼리 러너 연결한다.
    await qr.connect();
    // 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면 트랜잭션 안에서 데이터베이스 액션을
    // 실행할 수 있다.
    await qr.startTransaction();

    // 코드 중간에서 qr를 인자로 받아야하기 때문에.
    req.queryRunner = qr;

    return next.handle().pipe(
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
      catchError(async (e) => {
        // 어떤 에러가 던져지면
        // 트랜잭션을 종료하고 원래 상태로 되돌린다.
        await qr.rollbackTransaction();
        await qr.release();

        throw new InternalServerErrorException(e.message);
      }),
    );
  }
}
