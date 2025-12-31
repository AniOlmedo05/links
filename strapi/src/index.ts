import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      console.log('--- Bootstrap Start ---');

      // 1. Seed Links
      const allDrafts = await strapi.documents('api::link.link').findMany({ status: 'draft' });
      const allPublished = await strapi.documents('api::link.link').findMany({ status: 'published' });

      console.log(`Initial Link count - Drafts: ${allDrafts.length}, Published: ${allPublished.length}`);

      if (allDrafts.length === 0 && allPublished.length === 0) {
        console.log('Seeding initial links...');
        const github = await strapi.documents('api::link.link').create({
          data: {
            name: 'GitHub',
            url: 'https://github.com/franciscomanuelolmedocorts',
            icon: 'Github',
            classes: 'bg-black/80 hover:bg-black border-neutral-800 text-white',
            order: 1,
          },
        });
        await strapi.documents('api::link.link').publish({ documentId: github.documentId });

        const linkedin = await strapi.documents('api::link.link').create({
          data: {
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/francisco-olmedo-cortes',
            icon: 'Linkedin',
            classes: 'bg-[#0077b5]/80 hover:bg-[#0077b5] border-[#0077b5]/50 text-white',
            order: 2,
          },
        });
        await strapi.documents('api::link.link').publish({ documentId: linkedin.documentId });
      }

      // 2. Seed Global Settings
      const globalSettingsDraft = await strapi.documents('api::global.global').findMany({ status: 'draft' });
      const globalSettingsPublished = await strapi.documents('api::global.global').findMany({ status: 'published' });

      if (globalSettingsDraft.length === 0 && globalSettingsPublished.length === 0) {
        console.log('Seeding initial global settings...');
        const global = await strapi.documents('api::global.global').create({
          data: {
            pageTitle: 'Francisco Manuel Olmedo | BlakIA Links',
            name: 'Francisco Manuel Olmedo Cortés',
            description: 'CEO & AI Architect',
            footerText: 'Made with ♡ by BlakIA',
            backgroundClasses: 'bg-neutral-950',
          },
        });
        await strapi.documents('api::global.global').publish({ documentId: global.documentId });
        console.log('Created and Published Global settings');
      }

      // 3. Set permissions for the Public role
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        console.log(`Found Public role ID: ${publicRole.id}`);
        const permissions = await strapi.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id }
        });

        const actionsToGrant = ['api::link.link.find', 'api::global.global.find'];

        for (const action of actionsToGrant) {
          const hasPermission = permissions.some(p => p.action === action);
          if (!hasPermission) {
            console.log(`Granting "${action}" permission to Public role...`);
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                role: publicRole.id,
                action: action,
              },
            });
          }
        }
      }
      console.log('--- Bootstrap End ---');
    } catch (error) {
      console.error('Error during Strapi bootstrap:', error);
    }
  },
};
