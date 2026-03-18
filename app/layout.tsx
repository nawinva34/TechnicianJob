import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

const kanit = Kanit({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'] 
});

export const metadata: Metadata = {
  title: 'ระบบจัดหางานช่าง – TechnicianJob',
  description: 'ระบบที่ช่วยให้ผู้ดูแลประกาศงานและช่างเทคนิคสามารถรับงานได้ทันทีผ่าน LINE OA',
  keywords: ['ช่างเทคนิค', 'จัดหางาน', 'LINE OA', 'ช่างแอร์', 'ช่างประปา'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <body className={`${kanit.className} h-full antialiased text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
