import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { Model, Schema as MongooSchema } from 'mongoose';
import { Comment } from '../entities/comment.entity';
import { getModelToken } from '@nestjs/mongoose';
import { RoleItems } from '../../../modules/user/entities/user.entity';

describe('CommentService', () => {
  let service: CommentService;
  let model: Model<Comment>;

  const mockComment = {
    _id: '6645bf39a9403e5f93a52f90',
    postId: '6645bf39a9403e5f93a52f90',
    author: '6645bf39a9403e5f93a52f90',
    body: 'ttt',
    voteUp: [],
    createdAt: '2024-05-16T08:09:29.278Z',
    updatedAt: '2024-05-16T08:09:29.278Z',
  };

  const mockUser = {
    _id: new MongooSchema.Types.ObjectId('664313280d730245ead846c3'),
    name: 'u3',
    email: 'u3@mail.co',
    password: '$2b$05$LYETlGqZVF4vOBkPhibv6.jzk/NcZx.9zNa9ZONQLGPKBpbQW/8q6',
    avatar: null,
    role: RoleItems.NORMAL_USER,
    bio: 'User Of Comma',
    following: [],
    createdAt: new Date('2024-05-14T07:43:17.912Z'),
    updatedAt: new Date('2024-05-14T07:43:17.912Z'),
    __v: 2,
  };

  const mockCommentService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: getModelToken(Comment.name), useValue: mockCommentService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    model = module.get<Model<Comment>>(getModelToken(Comment.name));
  });

  describe('create', () => {
    it('should create a comment and return', async () => {
      const createCommentInput = {
        body: 'Test',
        postId: '6645bf39a9403e5f93a52f90',
      };

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce((): any => Promise.resolve(mockComment));

      const result = await service.create(createCommentInput, mockUser);

      expect(result).toEqual(mockComment);
    });
  });
});
