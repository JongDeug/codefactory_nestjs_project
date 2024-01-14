import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {
  }

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    /**
     * data: Data[],
     * total: number,
     */
    return {
      data: data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl =
      lastItem &&
      new URL(
        `${protocol}://${host}/${path}`,
      );

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *   after: 마지막 데이터의 ID
     * },
     * count : 응답한 데이터의 개수
     * next : 다음 요청을 할 때 사용할 URL
     */

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip -> page 기반일 때만
     */

    /**
     * where__id__more_than, where__likeCount__more_than, order__createdAt ... etc
     *
     * 1) where로 시작한다면 필터 로직을 적용한다.
     * 2) order로 시작한다면 정렬 로직을 적용한다.
     * 3) 필터 로직을 적용한다면 '__' 기준으로 split 했을 때 3개의 값으로 나뉘는지,
     *    2개의 값으로 나뉘는지 확인한다.
     *    3-1) 3개 값: FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
     *    3-1) 2개 값: 정확한 값을 필터하는 것이기 때문에 operator 없이 적용
     */

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseOptionsFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOptionsFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseOptionsFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    // where, order
    const options: FindOptionsWhere<T> | FindOptionsOrder<T> = {};

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where or order 필터는 '__'로 split 했을 때 길이가 2 또는 3이어야 합니다. - 문제되는 키값 ${key}`,
      );
    }

    // where__id = 3
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;

      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우,
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후
       * 값에 적용해준다.
       */
        // ['where', 'id, 'less_than']
      const [_, field, operator] = split;

      // where__id__between = 3, 4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');

      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }

      // if (operator === 'between') {
      //   options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      // } else {
      // options[field] = FILTER_MAPPER[operator](value);
      // }
    }

    return options;
  }
}
