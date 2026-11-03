import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | The Premiums Society',
  description: 'Enterprise Store Management Portal for The Premiums Society',
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ar_admin_token')?.value;

  // Verify auth on server
  const serverUser = token ? verifyToken(token) : null;

  // Fetch category count for sidebar Masters badge
  let categoryCount = 0;
  try {
    categoryCount = await prisma.category.count();
  } catch (_) {}

  return (
    <AdminLayoutClient serverUser={serverUser} categoryCount={categoryCount}>
      {children}
    </AdminLayoutClient>
  );
}
