import { Injectable } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import { ObjectStringifierHeader } from 'csv-writer/src/lib/record';

@Injectable()
export class CsvService {
  async createCsv(
    header: ObjectStringifierHeader,
    data: any[],
    filename: string,
  ): Promise<void> {
    const csvWriter = createObjectCsvWriter({
      path: `${filename}.csv`,
      header,
    });

    await csvWriter.writeRecords(data);
  }
}
