import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewsPaper } from './entities/news-paper.entity';
import { Between, Repository } from 'typeorm';
import { NewsPaperSection } from './entities/news-paper-section.entity';
import { CreateNewsPaperSectionDto } from './dto/create-news-paper-section.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NewsPaperService {
  constructor(
    @InjectRepository(NewsPaper)
    private readonly newsPaperRepo: Repository<NewsPaper>,
    @InjectRepository(NewsPaperSection)
    private readonly newsPaperSectionRepo: Repository<NewsPaperSection>,
  ) {}

  async create(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingNewsPaper = await this.newsPaperRepo.findOne({
      where: {
        userId,
        createdAt: Between(today, tomorrow),
      },
    });

    if (existingNewsPaper) {
      return {
        news_paper_id: existingNewsPaper.id,
        message: 'You already have a newspaper for today',
      };
    }

    const newNewsPaper = this.newsPaperRepo.create({ userId });
    await this.newsPaperRepo.save(newNewsPaper);
    return { news_paper_id: newNewsPaper.id, message: 'News Paper is created' };
  }

  // Add New Section
  async addSections(section: CreateNewsPaperSectionDto, userId: number) {
    const { newsPaperId, type, title, image, paragraph, order } = section;
    const newsPaper = await this.newsPaperRepo.findOne({
      where: { id: newsPaperId },
    });

    if (!newsPaper || newsPaper.userId !== userId) {
      throw new HttpException('News Paper not found', 404);
    }

    if (!this.isSameDay(newsPaper.createdAt)) {
      throw new HttpException(
        'Cannot add section to a news paper created on a different day',
        403,
      );
    }
    const newSection = this.newsPaperSectionRepo.create({
      newsPaperId,
      type,
      title,
      image,
      paragraph,
      order,
    });

    await this.newsPaperSectionRepo.save(newSection);

    return {
      message: 'Section added successfully',
      id: newSection.id,
    };
  }

  async getNewsPaperById(id: number, userId: number = 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newsPaper = await this.newsPaperRepo
      .createQueryBuilder('newsPaper')
      .leftJoinAndSelect('newsPaper.sections', 'section')
      .leftJoinAndSelect('newsPaper.user', 'user')
      .where(
        'newsPaper.id = :id AND (newsPaper.createdAt < :today OR newsPaper.userId = :userId)',
        {
          id,
          today,
          userId,
        },
      )
      .getOne();

    if (!newsPaper) {
      throw new HttpException('News Paper not found', 404);
    }

    return plainToInstance(NewsPaper, newsPaper);
  }

  async getYesterdayNewsPapers(page: number, limit: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const queryBuilder = this.newsPaperRepo
      .createQueryBuilder('newsPaper')
      .leftJoinAndSelect('newsPaper.sections', 'section')
      .leftJoinAndSelect('newsPaper.user', 'user')
      .where(
        'newsPaper.createdAt >= :yesterday AND newsPaper.createdAt < :today',
        {
          yesterday,
          today,
        },
      )
      .orderBy('newsPaper.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [newsPapers, total] = await queryBuilder.getManyAndCount();

    const transformedNewsPapers = plainToInstance(NewsPaper, newsPapers);

    return {
      data: transformedNewsPapers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  // utils
  isSameDay(date: Date): boolean {
    const today = new Date();
    const createdAt = new Date(date);

    return (
      createdAt.getDate() === today.getDate() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getFullYear() === today.getFullYear()
    );
  }

  findAll() {
    return `This action returns all newsPaper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} newsPaper`;
  }

  // update(id: number, updateNewsPaperDto: UpdateNewsPaperDto) {
  //   return `This action updates a #${id} newsPaper`;
  // }

  remove(id: number) {
    return `This action removes a #${id} newsPaper`;
  }
}
