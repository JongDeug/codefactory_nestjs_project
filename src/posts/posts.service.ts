import {Injectable, NotFoundException} from '@nestjs/common';


export interface PostModel {
    id: number;
    author: string;
    title: string;
    content: string;
    likeCount: number;
    commentCount: number;
}

let posts: PostModel[] = [
    {
        id: 1,
        author: 'newjeans_official',
        title: '뉴진스 민지',
        content: '메이크업 고치고 있는 민지',
        likeCount: 1000000,
        commentCount: 99999,
    },
    {
        id: 2,
        author: 'newjeans_official',
        title: '뉴진스 해린',
        content: '메이크업 고치고 있는 해린',
        likeCount: 1000000,
        commentCount: 99999,
    },
    {
        id: 3,
        author: 'blackpink_official',
        title: '블랙핑크',
        content: '메이크업 고치고 있는 제니',
        likeCount: 1000000,
        commentCount: 99999,
    },
];

@Injectable()
export class PostsService {
    getAllPosts() {
        return posts;
    }

    getPostById(id: number) {
        const post = posts.find((post) => post.id === +id);

        if (!post) {
            // NestJS에서 제공하는 built-in 에러
            throw new NotFoundException();
        }

        return posts;
    }

    createPost(author: string, title: string, content: string) {
        const post = {
            id: posts[posts.length - 1].id + 1,
            author,
            title,
            content,

            likeCount: 0,
            commentCount: 0,
        };

        return (posts = [...posts, post]);
    }

    updatePost(postId: number, author: string, title: string, content: string) {
        const post = posts.find((post) => post.id === postId);

        if (!post) {
            throw new NotFoundException();
        }

        if (author) {
            post.author = author;
        }

        if (title) {
            post.title = title;
        }
        if (content) {
            post.content = content;
        }

        posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));
        return post;
    }

    deletePost(postId: number) {
        const post = posts.find((post) => post.id === postId);

        if (!post) {
            throw new NotFoundException();
        }

        posts = posts.filter((post) => post.id !== postId);

        return postId;
    }
}