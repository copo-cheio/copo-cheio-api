/* const QRCode = require('qrcode');
const fs = require('fs');
*/
const {Jimp} = require('jimp');
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
/* import {Jimp} = require('jimp'); */

export async function generateQrWithLogo(
  data: any,
  logoPath: string,
  outputPath: string,
) {
  try {
    console.log('Generating QR Code with Logo...');
    console.log({data, logoPath, outputPath});

    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid data format: Data should be an object');
    }

    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo file not found at: ${logoPath}`);
    }
    console.log('Logo file exists.');

    const qrBuffer = await QRCode.toBuffer(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    });
    console.log(`QR Buffer generated. Length: ${qrBuffer.length}`);

    // Load the QR code image
    const qrImage = await Jimp.read(qrBuffer);
    console.log('QR Code Image Loaded.');

    // Load the logo image
    const logo = await Jimp.read(logoPath);
    console.log('Logo Image Loaded.');

    if (!qrImage.bitmap?.width || !qrImage.bitmap.height) {
      throw new Error('Error: QR code image is missing valid dimensions.');
    }

    console.log(
      `QR Code Dimensions: ${qrImage.bitmap.width}x${qrImage.bitmap.height}`,
    );

    // Load the logo image

    // Check logo dimensions
    if (!logo.bitmap?.width || !logo.bitmap.height) {
      throw new Error('Invalid logo dimensions.');
    }
    console.log(`Logo Dimensions: ${logo.bitmap.width}x${logo.bitmap.height}`);

    // Resize the logo
    const logoSize = Math.floor(qrImage.bitmap.width / 5);
    console.log('Logo size to resize:', logoSize);

    // Check if logoSize is a valid number
    if (isNaN(logoSize) || logoSize <= 0) {
      throw new Error('Invalid logo size calculated.');
    }

    // Attempt to resize logo
    try {
      //logo.resize(logoSize, Jimp.default.AUTO); // Ensure resize arguments are correct
      console.log(
        `Resized Logo Dimensions: ${logo.bitmap.width}x${logo.bitmap.height}`,
      );
    } catch (resizeError) {
      console.error('Error resizing logo:', resizeError);
      throw resizeError; // Re-throw to catch it in the main try block
    }
    const xPos = (qrImage.bitmap.width - logo.bitmap.width) / 2;
    const yPos = (qrImage.bitmap.height - logo.bitmap.height) / 2;

    console.log({qrImage, logo, xPos, yPos});
    qrImage.composite(logo, xPos, yPos, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1,
    });
    console.log('Logo merged into QR code.');

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
      console.log(`Created directory: ${dir}`);
    }

    // Save the final image
    /*     await qrImage.writeAsync(outputPath); */

    qrImage.write(outputPath, err => {
      if (err) {
        console.error('Error saving QR Code with logo:', err);
      } else {
        console.log(`QR Code with logo saved at: ${outputPath}`);
      }
    });
    /*    console.log(`QR Code with logo saved at: ${outputPath}`); */
  } catch (err) {
    console.error('Error generating QR code with logo:', err);
  }
}
/*

export async function generateQrWithLogo(
  data: any,
  logoPath: any,
  outputPath: any,
) {
  console.log({data, logoPath, outputPath});

  console.log('Logo Path:', logoPath);
  console.log('Output Path:', outputPath);
  const _data = {
    action: 'VALIDATE_ORDER',
    type: 'order',
    code: '019507c2-a112-7584-bdc8-4bdc50ba35fe',
    refId: '7fe3ac4f-a417-4256-bd7e-4cb0d51ca30e',
  };

  console.log('Data passed:', _data);

  // Ensure the data is an object
  if (typeof _data !== 'object' || _data === null) {
    console.error('Invalid data format');
    return;
  }
  // Check if logo exists
  fs.access(logoPath, fs.constants.F_OK, err => {
    if (err) console.error('Logo not found:', err);
    else console.log('Logo file exists.');
  });
  try {
    // Generate QR code as a buffer
    console.log({data, t: typeof data});
    const qrBuffer = await QRCode.toBuffer(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    });

    console.log('QR Buffer Length:', qrBuffer.length);

    // Write the QR buffer to the output file
    fs.writeFileSync(outputPath, qrBuffer);
    console.log('TMP FILE WRITTEN:'); // This log should work now

    // Load the QR code image

    // Load the logo image
    const logo = await Jimp.read(logoPath);
    console.log('Logo Image Loaded:');

    const qrImage = await Jimp.read(qrBuffer);
    console.log('QR Code Image Loaded:');
    // Verify the dimensions before proceeding
    if (!qrImage.bitmap?.width || !qrImage.bitmap.height) {
      console.error('Error: QR code image is missing valid dimensions.');
      return;
    }

    console.log('QR Code width:', qrImage.bitmap.width);
    console.log('QR Code height:', qrImage.bitmap.height);

    // Resize the logo to fit into the center of the QR code
    try {
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      console.log('Logo type:', typeof logo);
      console.log('Logo instance check:', logo instanceof Jimp);
      console.log('Logo properties:', logo.bitmap);
      console.log('QR Image Width:', qrImage.bitmap.width);
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      console.log('xxxxxxxxxxxxxxxx');
      if (logo) {
        //logo.resize(qrImage.bitmap.width / 5, Jimp.AUTO);
        const newWidth = Math.floor(Number(qrImage.bitmap.width) / 5);
        console.log('Resizing logo to width:', newWidth);

        //logo.resize(newWidth, Jimp.AUTO);
        // logo.resize(100, Jimp.RESIZE_BILINEAR); // Explicit resize mode
        console.log('LOGO RESIZE');
      } else {
        console.error('Logo failed to load', logo);
      }
    } catch (ex) {
      console.log('xxxxxxxxx', ex);
      throw new Error('xxx');
    }

    // Calculate the position to place the logo in the center of the QR code
    const xPos = (qrImage.bitmap.width - logo.bitmap.width) / 2;
    const yPos = (qrImage.bitmap.height - logo.bitmap.height) / 2;
    console.log('LOGO POS');

    // Composite the logo onto the QR code
    qrImage.composite(logo, xPos, yPos, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1,
    });
    console.log('QR COMPOSITE', outputPath);

    // Save the final image
    await qrImage.writeAsync(outputPath);
    console.log('QR Code with logo generated successfully.');
  } catch (err) {
    console.error('Error generating QR code with logo:', err);
  }
}
 */
