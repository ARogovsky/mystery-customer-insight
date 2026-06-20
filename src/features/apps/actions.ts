'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { getCurrentProfile } from '@/libs/Profile';
import { apps } from '@/models/Schema';

const PLATFORMS = ['ios', 'android', 'web', 'other'] as const;

const CreateAppSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  appUrl: z.url(),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
});

export async function createApp(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'developer') {
    throw new Error('Forbidden');
  }

  const parsed = CreateAppSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    appUrl: formData.get('appUrl'),
    platforms: formData.getAll('platforms'),
  });

  if (!parsed.success) {
    throw new Error('Invalid input');
  }

  await db.insert(apps).values({
    developerId: profile.id,
    name: parsed.data.name,
    description: parsed.data.description,
    appUrl: parsed.data.appUrl,
    platforms: parsed.data.platforms,
  });

  revalidatePath('/dashboard/apps');
}
