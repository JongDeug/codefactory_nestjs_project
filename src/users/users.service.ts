import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    // 1) nickname 중복이 없는지 확인
    // exist() => 만약에 조건에 해당되는 값이 있으면 true 반환
    const nicknameExists = await this.usersRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException('이미 존재하는 nickname 입니다!');
    }

    const emailExists = await this.usersRepository.exists({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('이미 가입한 이메일입니다!');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    return await this.usersRepository.save(user);
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async followUser(followerId: number, followeeId: number) {
    // const user = await this.usersRepository.findOne({
    //   where: {
    //     id: followerId,
    //   },
    //   relations: ['followees'],
    // });
    //
    // if (!user) {
    //   throw new NotFoundException('존재하지 않는 팔로워 입니다.');
    // }
    //
    // await this.usersRepository.save({
    //   ...user,
    //   followees: [
    //     ...user.followees,
    //     {
    //       id: followeeId,
    //     },
    //   ],
    // });

    const result = await this.userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    // const user = await this.usersRepository.findOne({
    //   where: {
    //     id: userId,
    //   },
    //   relations: ['followers'],
    // });
    //
    // return user.followers;

    const where = {
      followee: {
        id: userId,
      },
    };

    // 컨펌을 하지 않은 것들을 포함? (false)일 경우에만
    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowersRepository.find({
      where,
      relations: ['follower', 'followee'],
    });
    /**
     * [
     *   {
     *     id: number;
     *     follower: UsersModel;
     *     ,,,
     *   },
     * ]
     */
    return result.map((item) => ({
      id: item.follower.id,
      nickname: item.follower.nickname,
      email: item.follower.email,
      isConfirmed: item.isConfirmed,
    }));
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    const existing = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: ['follower', 'followee'],
    });

    if (!existing) {
      throw new NotFoundException('존재하지 않는 팔로우 요청입니다.');
    }

    await this.userFollowersRepository.save({
      ...existing,
      isConfirmed: true,
    });

    return true;
  }

  async deleteFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });
  }

  async incrementFollowerCount(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.increment(
      {
        id: followerId,
      },
      'followerCount',
      1,
    );

    await userRepository.increment(
      {
        id: followeeId,
      },
      'followeeCount',
      1,
    );
  }

  async decrementFollowerCount(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userRepository = this.getUsersRepository(qr);

    await userRepository.decrement(
      {
        id: followerId,
      },
      'followerCount',
      1,
    );
    await userRepository.decrement(
      {
        id: followeeId,
      },
      'followeeCount',
      1,
    );
  }
}
