const QRCode = require('qrcode');
const Jimp = require('jimp');

export async function generateQrWithLogo(data:any, logoPath:any, outputPath:any) {
  try {
    // Generate QR code as a buffer
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    });

    // Load the QR code image
    const qrImage = await Jimp.read(qrBuffer);

    // Load the logo image
    const logo = await Jimp.read(logoPath);

    // Resize the logo to fit into the center of the QR code
    logo.resize(qrImage.bitmap.width / 5, Jimp.AUTO);

    // Calculate the position to place the logo in the center of the QR code
    const xPos = (qrImage.bitmap.width - logo.bitmap.width) / 2;
    const yPos = (qrImage.bitmap.height - logo.bitmap.height) / 2;

    // Composite the logo onto the QR code
    qrImage.composite(logo, xPos, yPos, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    });

    // Save the final image
    await qrImage.writeAsync(outputPath);
    console.log('QR Code with logo generated successfully.');
  } catch (err) {
    console.error('Error generating QR code with logo:', err);
  }
}
