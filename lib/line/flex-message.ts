import { Job } from '@/lib/types';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';

export function buildJobFlexMessage(job: Job) {
  const liffUrl = `https://liff.line.me/${liffId}?job_id=${job.id}`;
  const mapsUrl = job.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(job.location_name || '')}`;

  const statusColor = '#22c55e';

  const flexMessage = {
    type: 'flex',
    altText: `🔧 New Job: ${job.title}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0c4a6e',
        paddingAll: '20px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '🚨 มีงานใหม่เข้ามารอคุณอยู่!',
                color: '#7dd3fc',
                size: 'xs',
                weight: 'bold',
                flex: 0,
              },
              {
                type: 'filler',
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'ค่าตอบแทน',
                    color: '#ffffff',
                    size: 'xs',
                    weight: 'bold',
                  },
                ],
                backgroundColor: statusColor,
                paddingAll: '4px',
                paddingStart: '8px',
                paddingEnd: '8px',
                cornerRadius: '12px',
              },
            ],
            alignItems: 'center',
            marginBottom: '8px',
          },
          {
            type: 'text',
            text: job.title,
            color: '#ffffff',
            size: 'xl',
            weight: 'bold',
            wrap: true,
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: 'ผู้ที่กดรับงานก่อนจะได้รับสิทธิ์ในการทำงานนี้',
            color: '#ef4444',
            size: 'xs',
            wrap: true,
            align: 'center',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '📂',
                size: 'sm',
                flex: 0,
              },
              {
                type: 'text',
                text: `ประเภทงาน: ${job.category}`,
                size: 'sm',
                color: '#475569',
                margin: 'sm',
                flex: 1,
                weight: 'bold',
              },
            ],
            alignItems: 'center',
          },
          ...(job.description ? [{
            type: 'text',
            text: job.description,
            color: '#64748b',
            size: 'sm',
            wrap: true,
          }] : []),
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '📍', size: 'sm', flex: 0 },
              {
                type: 'text',
                text: job.location_name || 'Location TBD',
                size: 'sm',
                color: '#1e40af',
                margin: 'sm',
                flex: 1,
                wrap: true,
              },
            ],
            alignItems: 'flex-start',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '💰', size: 'sm', flex: 0 },
              {
                type: 'text',
                text: job.budget ? `฿${job.budget.toLocaleString()}` : 'Budget TBD',
                size: 'sm',
                color: '#15803d',
                margin: 'sm',
                weight: 'bold',
                flex: 1,
              },
            ],
            alignItems: 'center',
          },
          ...(job.customer_phone ? [{
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '📞', size: 'sm', flex: 0 },
              {
                type: 'text',
                text: `Customer: ${job.customer_phone}`,
                size: 'sm',
                color: '#475569',
                margin: 'sm',
                flex: 1,
              },
            ],
            alignItems: 'center',
          }] : []),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0284c7',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📋 กดรับงานตอนนี้',
              uri: liffUrl,
            },
          },
          ...(job.google_maps_url || job.location_name ? [{
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🗺️ View Location',
              uri: mapsUrl,
            },
          }] : []),
        ],
      },
    },
  };

  return flexMessage;
}
