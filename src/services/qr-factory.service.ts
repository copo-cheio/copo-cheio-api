import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as fs from 'fs';
import * as path from 'path';
import {v4} from 'uuid';
import {ImageRepository} from '../repositories';
import {generateQrWithLogo} from '../utils/qr';
import {storageService} from './minio/service';

export interface iQrCodeData {
  action: string;
  type: string;
  id?: string; // refId
  refId?: string; // refId
  code?: string;
}
@injectable({scope: BindingScope.TRANSIENT})
export class QrFactoryService {
  constructor(
    @repository('ImageRepository')
    public imageRepository: ImageRepository,
  ) {}

  async generateInviteCode(refId: string) {
    return this.findOrCreateQrCode(refId, {
      action: 'invite',
      type: 'staff',
      refId: refId,
    });
  }

  /**
   *
   * @param data
   * @param refId
   * @param description
   * @param v2
   * @returns
   */

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
    const outputPath = path.join(__dirname, basePath + objectName);
    const logoPath = path.join(__dirname, '../../data/logo-100.png');
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
        typeof data == 'string' ? JSON.parse(data) : data, //JSON.stringify(data),
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

  async findQrCodeByRefId(refId: string) {
    const image = await this.imageRepository.findOne({
      where: {
        and: [{refId}, {type: 'qr'}],
      },
    });
    return image;
  }
  async findOrCreateQrCode(refId, payload: any) {
    let qr = await this.findQrCodeByRefId(refId);
    if (!qr) {
      await this.generateAndUploadQrCode(
        {
          action: payload.action,
          type: payload.type,
          id: refId,
        },
        refId,
        payload.action,
      );
      qr = await this.findQrCodeByRefId(refId);
    }
    return qr;
  }
}
