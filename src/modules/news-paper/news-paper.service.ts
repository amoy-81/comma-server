import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewsPaper } from './entities/news-paper.entity';
import { Between, Repository } from 'typeorm';
import { NewsPaperSection } from './entities/news-paper-section.entity';
import { CreateNewsPaperSectionDto } from './dto/create-news-paper-section.dto';

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

  async addSections(section: CreateNewsPaperSectionDto, userId: number) {
    const { newsPaperId, type, title, image, paragraph, order } = section;
    const newsPaper = await this.newsPaperRepo.findOne({
      where: { id: newsPaperId },
    });
    if (!newsPaper || newsPaper.userId !== userId) {
      throw new HttpException('News Paper not found', 404);
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
