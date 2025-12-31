import { defineCollection, z } from 'astro:content';

const links = defineCollection({
    loader: async () => {
        const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
        const token = import.meta.env.STRAPI_TOKEN;

        try {
            const res = await fetch(`${baseUrl}/api/links?sort=order:asc`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
            });

            if (!res.ok) {
                console.warn('Strapi is not reachable or returned an error. Using empty links list.');
                return [];
            }

            const { data } = await res.json();
            return (data || []).map((item: any) => ({
                id: item.documentId,
                name: item.name,
                url: item.url,
                icon: item.icon,
                classes: item.classes,
                order: item.order,
            }));
        } catch (error) {
            console.error('Connection to Strapi failed during build. Check STRAPI_URL.');
            return [];
        }
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

        try {
            const res = await fetch(`${baseUrl}/api/global?populate=*`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
            });

            if (!res.ok) {
                console.warn('Failed to fetch global settings from Strapi. Using defaults.');
                return [];
            }

            const { data } = await res.json();
            if (!data) return [];

            const avatarMediaUrl = data.avatar ? `${baseUrl}${data.avatar.url}` : null;

            return [{
                id: data.documentId,
                pageTitle: data.pageTitle,
                name: data.name,
                description: data.description,
                avatarUrl: data.avatarUrl,
                avatar: avatarMediaUrl,
                backgroundClasses: data.backgroundClasses,
                cardStyle: data.cardStyle,
                customCardClasses: data.customCardClasses,
                cardBackgroundImage: data.cardBackgroundImage?.url ? baseUrl + data.cardBackgroundImage.url : null,
                footerText: data.footerText,
            }];
        } catch (error) {
            console.error('Connection to Strapi failed for Global settings.');
            return [];
        }
    },
    schema: z.object({
        id: z.string(),
        pageTitle: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        avatarUrl: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
        backgroundClasses: z.string().nullable().optional(),
        cardStyle: z.enum(['carbon', 'glass', 'glossy', 'neon', 'minimal', 'custom']).nullable().optional(),
        customCardClasses: z.string().nullable().optional(),
        cardBackgroundImage: z.string().nullable().optional(),
        footerText: z.string().nullable().optional(),
    }),
});

export const collections = { links, global };
