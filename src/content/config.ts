import { defineCollection, z } from 'astro:content';

const links = defineCollection({
    loader: async () => {
        const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
        const token = import.meta.env.STRAPI_TOKEN;

        const res = await fetch(`${baseUrl}/api/links?sort=order:asc`, {
            headers: token ? {
                Authorization: `Bearer ${token}`,
            } : {},
        });

        if (!res.ok) {
            console.error('Failed to fetch links from Strapi');
            return [];
        }

        const { data } = await res.json();

        return data.map((item: any) => ({
            id: item.documentId,
            name: item.name,
            url: item.url,
            icon: item.icon,
            classes: item.classes,
            order: item.order,
        }));
    },
    schema: z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        icon: z.string().nullable().optional(),
        classes: z.string().nullable().optional(),
        order: z.number().nullable().optional(),
    }),
});

const global = defineCollection({
    loader: async () => {
        const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
        const token = import.meta.env.STRAPI_TOKEN;

        const res = await fetch(`${baseUrl}/api/global?populate=*`, {
            headers: token ? {
                Authorization: `Bearer ${token}`,
            } : {},
        });

        if (!res.ok) {
            console.error('Failed to fetch global settings from Strapi');
            return [];
        }

        const { data } = await res.json();
        if (!data) return [];

        // In Strapi 5, media fields are objects. We resolve the URL.
        const avatarMediaUrl = data.avatar ? `${baseUrl}${data.avatar.url}` : null;

        return [{
            id: data.documentId,
            pageTitle: data.pageTitle,
            name: data.name,
            description: data.description,
            avatarUrl: data.avatarUrl,
            avatar: avatarMediaUrl,
            backgroundClasses: data.backgroundClasses,
            footerText: data.footerText,
        }];
    },
    schema: z.object({
        id: z.string(),
        pageTitle: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        avatarUrl: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
        backgroundClasses: z.string().nullable().optional(),
        footerText: z.string().nullable().optional(),
    }),
});

export const collections = { links, global };
