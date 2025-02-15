const QRCode = require('qrcode');
const {Jimp} = require('jimp');
const fs = require('fs');

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
    const qrImage = await Jimp.read(qrBuffer);
    console.log('QR Code Image Loaded:');

    // Load the logo image
    const logo = await Jimp.read(logoPath);
    console.log('Logo Image Loaded:');

    // Verify the dimensions before proceeding
    if (!qrImage.bitmap?.width || !qrImage.bitmap.height) {
      console.error('Error: QR code image is missing valid dimensions.');
      return;
    }

    console.log('QR Code width:', qrImage.bitmap.width);
    console.log('QR Code height:', qrImage.bitmap.height);

    // Resize the logo to fit into the center of the QR code
    try {
      if (logo) {
        logo.resize(qrImage.bitmap.width / 5, Jimp.AUTO);
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
