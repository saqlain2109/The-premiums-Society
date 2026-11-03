import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let content = await prisma.websiteContent.findUnique({ where: { id: 'default' } });
    if (!content) {
      content = await prisma.websiteContent.create({
        data: {
          id: 'default',
          heroHeading: 'Elegance Reimagined for Every Celebration',
          heroSubheading: 'Explore premium handcrafted Panjabis, Banarasi Silks, Contemporary Kurtis and Casual Essentials made with supreme perfection.',
          heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
          heroPrimaryBtnText: 'Explore Collection',
          heroPrimaryBtnLink: '/shop',
          heroSecondaryBtnText: 'View Festive Panjabis',
          heroSecondaryBtnLink: '/shop?category=mens-panjabi-kurta',
          announcementBar: '✨ Eid & Wedding Festive Collection 2026 is LIVE! Fast WhatsApp Order & Home Delivery.',
          brandStoryTitle: 'Preserving Heritage, Crafting Contemporary Luxury',
          brandStoryText: 'The Premiums Society was born out of a profound admiration for Bengal rich handloom traditions combined with modern tailored precision.',
          brandStoryImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        },
      });
    }
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      heroHeading,
      heroSubheading,
      heroImage,
      heroPrimaryBtnText,
      heroPrimaryBtnLink,
      heroSecondaryBtnText,
      heroSecondaryBtnLink,
      announcementBar,
      brandStoryTitle,
      brandStoryText,
      brandStoryImage,
    } = body;

    const updated = await prisma.websiteContent.upsert({
      where: { id: 'default' },
      update: {
        heroHeading: heroHeading?.trim(),
        heroSubheading: heroSubheading?.trim(),
        heroImage: heroImage !== undefined ? heroImage : null,
        heroPrimaryBtnText: heroPrimaryBtnText?.trim(),
        heroPrimaryBtnLink: heroPrimaryBtnLink?.trim(),
        heroSecondaryBtnText: heroSecondaryBtnText?.trim(),
        heroSecondaryBtnLink: heroSecondaryBtnLink?.trim(),
        announcementBar: announcementBar !== undefined ? announcementBar : null,
        brandStoryTitle: brandStoryTitle?.trim(),
        brandStoryText: brandStoryText?.trim(),
        brandStoryImage: brandStoryImage !== undefined ? brandStoryImage : null,
      },
      create: {
        id: 'default',
        heroHeading: heroHeading?.trim() || 'Elegance Reimagined for Every Celebration',
        heroSubheading: heroSubheading?.trim() || 'Explore premium apparel tailored for perfection.',
        heroImage: heroImage || null,
        heroPrimaryBtnText: heroPrimaryBtnText?.trim() || 'Shop Collection',
        heroPrimaryBtnLink: heroPrimaryBtnLink?.trim() || '/shop',
        heroSecondaryBtnText: heroSecondaryBtnText?.trim() || 'Explore Categories',
        heroSecondaryBtnLink: heroSecondaryBtnLink?.trim() || '/#categories',
        announcementBar: announcementBar || null,
        brandStoryTitle: brandStoryTitle?.trim() || 'Our Brand Story',
        brandStoryText: brandStoryText?.trim() || 'Handmade luxury fashion.',
        brandStoryImage: brandStoryImage || null,
      },
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update website content' }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
