import './globals.css';
import QueryProvider from './QueryProvider';

export const metadata = {
  title: 'Med Tracker',
  description: 'Medication tracking dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
