import { Store } from '../types';

export function generateVCard(store: Store, publicUrl: string): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${store.name}`,
    `ORG;CHARSET=UTF-8:${store.name} (وادي سوف)`,
    `TITLE;CHARSET=UTF-8:${store.commune} - ولاية الوادي`,
    `TEL;TYPE=WORK,VOICE:${store.phone}`,
    store.phoneSecondary ? `TEL;TYPE=CELL:${store.phoneSecondary}` : '',
    `ADR;TYPE=WORK;CHARSET=UTF-8:;;${store.address};${store.commune};ولاية الوادي;39000;الجزائر`,
    `URL:${publicUrl}`,
    `NOTE;CHARSET=UTF-8:${store.description.slice(0, 160)}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  return vcard;
}

export function downloadVCard(store: Store, publicUrl: string) {
  const content = generateVCard(store, publicUrl);
  const blob = new Blob([content], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${store.slug}-contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
