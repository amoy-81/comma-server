import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenWord } from './entities/forbidden-word.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ForbiddenWord)
    private readonly forbiddenWordsRepository: Repository<ForbiddenWord>,
  ) {}

  async addForbiddenWords(words: string[]) {
    const uniqueWords = [...new Set(words)];
    const newWords = uniqueWords.map((word) => ({ word }));
    const result = await this.forbiddenWordsRepository.save(newWords);

    return { result, additionsCount: result.length };
  }

  async getForbiddenWords() {
    const result = await this.forbiddenWordsRepository.find();

    return { result, totalCount: result.length };
  }

  async checkForbiddenWordsSentence(
    sentence: string,
  ): Promise<{ containsForbiddenWords: boolean; words: string[] }> {
    const { result: forbiddenWords } = await this.getForbiddenWords();
    const forbiddenList = forbiddenWords.map((word) => word.word.toLowerCase());
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const foundWords = sentenceWords.filter((word) =>
      forbiddenList.includes(word),
    );
    return { containsForbiddenWords: foundWords.length > 0, words: foundWords };
  }
}
