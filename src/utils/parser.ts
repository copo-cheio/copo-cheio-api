import {BodyParser, RequestBody} from '@loopback/rest';
import multer from 'multer';
export const FORM_DATA = 'multipart/form-data';

export class MultipartFormDataBodyParser implements BodyParser {
  name = FORM_DATA;

  supports(mediaType: string) {
    // The mediaType can be
    // `multipart/form-data; boundary=--------------------------979177593423179356726653`
    return mediaType.startsWith(FORM_DATA);
  }

  async parse(request: any): Promise<RequestBody> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});
    return new Promise<RequestBody>((resolve, reject) => {
      upload.any()(request, {} as any, err => {
        if (err) return reject(err);
        resolve({
          value: {
            files: request.files,
            fields: (request as any).fields,
          },
        });
      });
    });
  }
}

export function findIdArrayEntries(a1, a2) {
  const available = a1.filter(item => a2.includes(item));
  const unavailable = a1.filter(item => !a2.includes(item));

  return {available, unavailable};
}
