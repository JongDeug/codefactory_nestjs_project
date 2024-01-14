import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginationDto {
  // page 기반 pagination에만 사용하는 프로퍼티
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID 보다 높은 ID부터 값을 가져오기
  // @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 정렬
  // createdAt -> 생성된 시간의 내림차/오름차 순으로 정렬
  @IsIn(['ASC', 'DESC'])  // 무조건 list에 들어와있는 값이여야 통과
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC'; // 이 기본값을 적용하게 하려면 main.ts에서 transform 프로퍼티를 적용시켜줘야함.

  // 몇개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take?: number = 20;
}