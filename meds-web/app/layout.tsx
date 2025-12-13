import './globals.css';
import QueryProvider from './QueryProvider';
import { AlertProvider } from './AlertProvider';



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
          <AlertProvider>

            {children}
          </AlertProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
