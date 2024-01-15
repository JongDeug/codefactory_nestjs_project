import { PickType } from '@nestjs/mapped-types';
import { ImagesModel } from '../../common/entity/images.entity';

export class CreatePostImageDto extends PickType(ImagesModel, ['path', 'post', 'order', 'type']){

}