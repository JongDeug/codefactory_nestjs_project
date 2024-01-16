import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';
import { RolesEnum } from '../../users/const/roles.const';
import { UsersModel } from '../../users/entity/users.entity';
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('토큰을 제공해주세요!');
    }

    if (user.role !== RolesEnum.ADMIN){
      throw new ForbiddenException(
        `이 작업을 수행할 권한이 없습니다. ${RolesEnum.ADMIN} 권한이 없습니다.`,
      );
    }

    const postId = req.params.id;

    if (!postId) {
      throw new BadRequestException(`postId가 파라미터로 제공돼야 합니다.!`);
    }

    // 포스트가 내꺼인지 확인까지 했다.?!
    const isPostMine = await this.postsService.isPostMine(
      parseInt(postId),
      user.id,
    );

    if (!isPostMine && user.role !== RolesEnum.ADMIN) {
      throw new ForbiddenException(
        `이 작업을 수행할 권한이 없습니다. post가 내것이 아니거나 ${RolesEnum.ADMIN} 권한이 없습니다.`,
      );
    }

    return true;
  }
}
