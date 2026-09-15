import QRCode from 'qrcode';
import { Store, QRConfig } from '../types';

export async function generateQrDataUrl(
  text: string,
  config?: Partial<QRConfig>,
  width = 600
): Promise<string> {
  const safeText = (text && text.trim()) || 'https://qr.myeloued.com';
  const colorDark = config?.color || '#D97706';
  const colorLight = config?.bgColor || '#FFFFFF';

  try {
    return await QRCode.toDataURL(safeText, {
      width,
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export async function generateQrSvgString(
  text: string,
  config?: Partial<QRConfig>
): Promise<string> {
  const safeText = (text && text.trim()) || 'https://qr.myeloued.com';
  const colorDark = config?.color || '#D97706';
  const colorLight = config?.bgColor || '#FFFFFF';

  try {
    return await QRCode.toString(safeText, {
      type: 'svg',
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return '';
  }
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  if (contentType === 'image/png' && content.startsWith('data:image/png')) {
    a.href = content;
  } else {
    const blob = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(blob);
  }
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Downloads a high resolution styled printable card as an image or trigger print
 */
export async function generatePrintableStandee(
  store: Store,
  qrDataUrl: string
): Promise<string> {
  // Create an offscreen canvas to composite the premium Saharan standee
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1800;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return qrDataUrl;

  // Background - Warm Saharan Linen
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(0, 0, width, height);

  // Outer border with gold accent
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#D97706';
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner hairline border
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E5E7EB';
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Top header banner (Desert gradient)
  const grad = ctx.createLinearGradient(0, 46, 0, 320);
  grad.addColorStop(0, '#1C1917');
  grad.addColorStop(1, '#292524');
  ctx.fillStyle = grad;
  ctx.fillRect(48, 48, width - 96, 280);

  // Brand tag
  ctx.fillStyle = '#D97706';
  ctx.font = 'bold 32px "Tajawal", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MY EL OUED QR • وادي سوف', width / 2, 120);

  // Store Name
  ctx.fillStyle = '#FAF7F2';
  ctx.font = 'bold 64px "Tajawal", sans-serif';
  ctx.fillText(store.name, width / 2, 210);

  // Store Commune / Category
  ctx.fillStyle = '#D6D3D1';
  ctx.font = '500 36px "Tajawal", sans-serif';
  ctx.fillText(`${store.commune} • ولاية الوادي`, width / 2, 275);

  // Decorative Saharan arch divider
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 150, 370);
  ctx.lineTo(width / 2 + 150, 370);
  ctx.stroke();

  // QR container card (white floating box)
  const qrBoxSize = 740;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 440;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;
  ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  ctx.shadowColor = 'transparent';

  // QR Card border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#F3F4F6';
  ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  // Load and draw QR code image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = qrDataUrl;
  });

  const qrDrawPadding = 50;
  ctx.drawImage(
    img,
    qrBoxX + qrDrawPadding,
    qrBoxY + qrDrawPadding,
    qrBoxSize - qrDrawPadding * 2,
    qrBoxSize - qrDrawPadding * 2
  );

  // If center logo requested
  if (store.qrConfig?.centerLogo && store.logo) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => resolve();
        logoImg.src = store.logo;
      });

      const logoSize = 130;
      const logoX = width / 2 - logoSize / 2;
      const logoY = qrBoxY + qrBoxSize / 2 - logoSize / 2;

      // white circular badge backing
      ctx.beginPath();
      ctx.arc(width / 2, qrBoxY + qrBoxSize / 2, logoSize / 2 + 12, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      // clip circle for logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, qrBoxY + qrBoxSize / 2, logoSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch {
      // ignore logo draw failure if CORS
    }
  }

  // Action instructions below QR
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 46px "Tajawal", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('وجّه كاميرا هاتفك وامسح الرمز', width / 2, 1260);

  ctx.fillStyle = '#78716C';
  ctx.font = '500 32px "Tajawal", sans-serif';
  ctx.fillText('للوصول المباشر إلى قائمة المنتجات • الواتساب • والموقع الجغرافي', width / 2, 1325);

  // Feature icons pill boxes
  const pillsY = 1400;
  ctx.fillStyle = '#FEF3C7';
  ctx.roundRect(width / 2 - 380, pillsY, 760, 100, 20);
  ctx.fill();
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 30px "Tajawal", sans-serif';
  ctx.fillText('⚡ تواصل مباشر • 📍 اتجاهات الخريطة • 🏷️ عروض وتخفيضات', width / 2, pillsY + 62);

  // Footer URL & Phone
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`qr.myeloued.com/q/${store.slug}`, width / 2, 1600);

  ctx.fillStyle = '#A8A29E';
  ctx.font = '500 28px "Tajawal", sans-serif';
  ctx.fillText(`هاتف: ${store.phone} • منصة وادي سوف الرقمية`, width / 2, 1660);

  return canvas.toDataURL('image/png');
}
