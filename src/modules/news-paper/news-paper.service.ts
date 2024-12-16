import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewsPaper } from './entities/news-paper.entity';
import { Between, Repository } from 'typeorm';
import { NewsPaperSection } from './entities/news-paper-section.entity';
import { CreateNewsPaperSectionDto } from './dto/create-news-paper-section.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateNewsPaperSectionDto } from './dto/update-news-paper-section.dto';

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
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

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
    today.setUTCHours(0, 0, 0, 0);

    const newsPaper = await this.newsPaperRepo
      .createQueryBuilder('newsPaper')
      .leftJoinAndSelect('newsPaper.sections', 'section')
      .leftJoinAndSelect('newsPaper.user', 'user')
      .where(
        `
        newsPaper.id = :id AND 
         (
            DATE(newsPaper.createdAt) < DATE(:today) OR 
            newsPaper.userId = :userId
          )
        `,
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
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);

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

  async editSection(
    sectionId: number,
    userId: number,
    updatedData: UpdateNewsPaperSectionDto,
  ) {
    const section = await this.newsPaperSectionRepo.findOne({
      where: { id: sectionId },
      relations: ['newsPaper'],
    });

    if (!section) {
      throw new HttpException('Section not found', 404);
    }

    if (section.newsPaper.userId !== userId) {
      throw new HttpException(
        'You are not authorized to edit this section',
        403,
      );
    }

    const isCreatedToday = this.isSameDay(section.createdAt);
    if (!isCreatedToday) {
      throw new HttpException('You can only edit sections created today', 403);
    }

    Object.assign(section, updatedData);

    await this.newsPaperSectionRepo.save(section);

    return {
      message: 'Section updated successfully',
      id: section.id,
      newsPaperId: section.newsPaper.id,
    };
  }

  async deleteSection(sectionId: number, userId: number) {
    const section = await this.newsPaperSectionRepo.findOne({
      where: { id: sectionId },
      relations: ['newsPaper'],
    });

    if (!section) {
      throw new HttpException('Section not found', 404);
    }

    if (section.newsPaper.userId !== userId) {
      throw new HttpException(
        'You are not authorized to delete this section',
        403,
      );
    }

    const isCreatedToday = this.isSameDay(section.createdAt);
    if (!isCreatedToday) {
      throw new HttpException(
        'You can only delete sections created today',
        403,
      );
    }

    await this.newsPaperSectionRepo.delete(sectionId);

    return {
      message: 'Section deleted successfully',
      id: sectionId,
    };
  }

  // utils
  isSameDay(date: Date): boolean {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const createdAt = new Date(date);

    return (
      createdAt.getDate() === today.getDate() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getFullYear() === today.getFullYear()
    );
  }
}
