import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as fs from 'fs';
import * as path from 'path';
import {v4} from 'uuid';
import {ImageRepository} from '../repositories';
import {generateQrWithLogo} from '../utils/qr';
import {storageService} from './minio/service';
@injectable({scope: BindingScope.TRANSIENT})
export class QrFactoryService {
  constructor(
    @repository('ImageRepository')
    public imageRepository: ImageRepository,
  ) {}

  async generateAndUploadQrCode(
    data: any,
    refId: string,
    description: string = '',
    v2?: boolean,
  ) {
    const basePath = '../../data/';
    const objectName =
      'qr-output.' +
      v4().replace(/\d+/g, '').replace('-g', '') +
      Date.now() +
      '.png';
    const outputPath = path.join(__dirname, basePath + objectName + '.png');
    const logoPath = path.join(__dirname, '../../data/logo.png');
    try {
      // Generate QR code with logo
      const query: any = {
        refId,
        description,
        type: 'qr',
      };
      if (v2) {
        query.orderV2Id = refId;
      }
      let qrRecord: any = await this.imageRepository.findOne({
        where: query,
      });

      if (qrRecord) return qrRecord;
      await generateQrWithLogo(
        typeof data == 'string' ? {data} : data, //JSON.stringify(data),
        logoPath,
        outputPath,
      );

      // Upload the file to Minio
      const {url} = await storageService().uploadQr(outputPath, objectName);

      qrRecord = await this.imageRepository.create({
        url,
        ...query,
      });

      console.log('QR code with logo generated and uploaded successfully.');
      return qrRecord;
    } catch (err) {
      console.error('Error in generating or uploading QR code:', err);
      throw new Error(err);
    } finally {
      if (fs.existsSync(outputPath)) {
        // Delete the file from local storage
        fs.unlinkSync(outputPath);
      }
    }
  }
}
