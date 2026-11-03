import './globals.css';
import { CartProvider } from '@/components/store/CartContext';
import CartDrawer from '@/components/store/CartDrawer';

export const metadata = {
  title: 'The Premiums Society | Handcrafted Ethnic & Contemporary Clothing',
  description: 'Shop exclusive Panjabis, Banarasi sarees, luxury kurtis, and casual apparel with fast nationwide delivery and WhatsApp ordering.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
