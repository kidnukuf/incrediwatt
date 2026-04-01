import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createEvent,
  createFoodPhoto,
  createPost,
  createSpecial,
  deleteEvent,
  deleteFoodPhoto,
  deletePost,
  deleteSpecial,
  getActivePromotions,
  getActiveSpecials,
  getAllEvents,
  getAllFoodPhotos,
  getAllMenuItems,
  getAllPosts,
  getAllPromotions,
  getAllSpecials,
  getFeaturedMenuItems,
  getFoodPhotosByMenuItem,
  getMenuCategories,
  getMenuItemById,
  getMenuItemsByCategory,
  getPostById,
  getPostCount,
  getPostsInRange,
  getScheduledPosts,
  getUpcomingEvents,
  toggleMenuItemFeatured,
  togglePromotion,
  updateMenuItemPhoto,
  updatePost,
  updatePromotion,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { postToSocialMedia } from "./_core/socialMedia";

// ─── Brand voice system prompt ────────────────────────────────────────────────
const BRAND_SYSTEM_PROMPT = `You are the social media manager for Sopris Taqueria, a warm, family-friendly restaurant located inside 4 Jacks Casino in Jackpot, Nevada.

Brand voice: Warm, casual, welcoming, and fun. The restaurant serves both American comfort food and authentic Mexican cuisine. The community is a mix of locals, truckers, casino guests, and families.

When writing posts:
- Keep captions conversational and inviting
- Use exclamation points sparingly but enthusiastically
- Reference the casino location when relevant ("Stop in next time you're at 4 Jacks!")
- Highlight value, freshness, and authenticity
- For Mexican dishes, emphasize authentic flavors and ingredients
- For American dishes, emphasize comfort, size, and quality
- Always include a call to action (visit us, come in, try it, etc.)
- Hashtags should include: #SoprisTaqueria #JackpotNV #4JacksCasino and dish-specific tags

For bilingual posts (every other post), write the Spanish version using simple, accessible Spanish that both native speakers and learners can understand. Keep the warmth and energy of the English version.`;

// ─── Post generation helper ───────────────────────────────────────────────────
async function generateBilingualPost(params: {
  type: string;
  itemName?: string;
  itemNameEs?: string;
  description?: string;
  price?: number;
  category?: string;
  isBilingual: boolean;
  extraContext?: string;
}) {
  const { type, itemName, itemNameEs, description, price, category, isBilingual, extraContext } = params;

  let userPrompt = "";

  if (type === "menu_item") {
    userPrompt = `Create a social media post for this menu item:
Name: ${itemName}${itemNameEs ? ` (Spanish: ${itemNameEs})` : ""}
Category: ${category}
${description ? `Description: ${description}` : ""}
${price ? `Price: $${price.toFixed(2)}` : ""}
${extraContext ? `Additional context: ${extraContext}` : ""}

${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}
Include relevant hashtags.`;
  } else if (type === "taco_tuesday") {
    userPrompt = `Create a Taco Tuesday social media post for Sopris Taqueria. 
Highlight our authentic street tacos starting at $3.99 each, available in Carne Asada, Adobada, Al Pastor, Pollo, Alambre, Carnitas, and Lengua.
${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}
Include #TacoTuesday in the hashtags.`;
  } else if (type === "special") {
    userPrompt = `Create a social media post for this weekly special:
${itemName}
${description ? `Details: ${description}` : ""}
${price ? `Special price: $${price.toFixed(2)}` : ""}
${extraContext ? `Additional context: ${extraContext}` : ""}
${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}`;
  } else if (type === "event") {
    userPrompt = `Create a social media post to promote this event at Sopris Taqueria:
Event: ${itemName}
${description ? `Details: ${description}` : ""}
${extraContext ? `Additional context: ${extraContext}` : ""}
${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}`;
  } else if (type === "promotion") {
    userPrompt = `Create a social media post to promote this offer at Sopris Taqueria:
Promotion: ${itemName}
${description ? `Details: ${description}` : ""}
${extraContext ? `Additional context: ${extraContext}` : ""}
${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}`;
  } else {
    userPrompt = `Create a social media post for Sopris Taqueria.
${extraContext || "General restaurant promotion post."}
${isBilingual ? "Write BOTH an English caption AND a Spanish caption." : "Write an English caption only."}`;
  }

  const response = await invokeLLM({
    messages: [
      { role: "system" as const, content: BRAND_SYSTEM_PROMPT },
      { role: "user" as const, content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "social_post",
        strict: true,
        schema: {
          type: "object",
          properties: {
            captionEn: { type: "string", description: "English caption for the post" },
            captionEs: { type: "string", description: "Spanish caption (empty string if not bilingual)" },
            hashtags: { type: "string", description: "Hashtags as a single string" },
          },
          required: ["captionEn", "captionEs", "hashtags"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) throw new Error("No response from LLM");
  const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  return JSON.parse(content) as { captionEn: string; captionEs: string; hashtags: string };
}

// ─── Routers ──────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Menu ───────────────────────────────────────────────────────────────────
  menu: router({
    list: publicProcedure.query(() => getAllMenuItems()),
    categories: publicProcedure.query(() => getMenuCategories()),
    byCategory: publicProcedure.input(z.object({ category: z.string() })).query(({ input }) =>
      getMenuItemsByCategory(input.category)
    ),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      getMenuItemById(input.id)
    ),
    featured: publicProcedure.query(() => getFeaturedMenuItems()),
    toggleFeatured: protectedProcedure
      .input(z.object({ id: z.number(), isFeatured: z.boolean() }))
      .mutation(({ input }) => toggleMenuItemFeatured(input.id, input.isFeatured)),
    updatePhoto: protectedProcedure
      .input(z.object({ id: z.number(), photoUrl: z.string() }))
      .mutation(({ input }) => updateMenuItemPhoto(input.id, input.photoUrl)),
  }),

  // ─── Posts ──────────────────────────────────────────────────────────────────
  posts: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(({ input }) => getAllPosts(input?.limit, input?.offset)),

    scheduled: protectedProcedure.query(() => getScheduledPosts()),

    inRange: protectedProcedure
      .input(z.object({ from: z.number(), to: z.number() }))
      .query(({ input }) => getPostsInRange(input.from, input.to)),

    counts: protectedProcedure.query(() => getPostCount()),

    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPostById(input.id)),

    create: protectedProcedure
      .input(
        z.object({
          platform: z.enum(["facebook", "instagram", "both"]).default("both"),
          captionEn: z.string().min(1),
          captionEs: z.string().optional(),
          hashtags: z.string().optional(),
          imageUrl: z.string().optional(),
          menuItemId: z.number().optional(),
          postType: z.enum(["menu_item", "special", "event", "promotion", "taco_tuesday", "manual", "borderline_brew"]),
          status: z.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
          scheduledAt: z.number().optional(),
          relatedId: z.number().optional(),
        })
      )
      .mutation(({ input }) => createPost(input)),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          captionEn: z.string().optional(),
          captionEs: z.string().optional(),
          hashtags: z.string().optional(),
          imageUrl: z.string().optional(),
          status: z.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
          scheduledAt: z.number().optional(),
          platform: z.enum(["facebook", "instagram", "both"]).optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updatePost(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePost(input.id)),

    publishNow: protectedProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const post = await getPostById(input.id);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        if (post.status === "published") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Post already published" });
        }

        const caption = post.captionEs
          ? `${post.captionEn}\n\n🇲🇽 ${post.captionEs}`
          : post.captionEn;

        const isVideo = /\.(mp4|mov|webm|avi)(\?|$)/i.test(post.imageUrl ?? "");
        const result = await postToSocialMedia({
          caption,
          imageUrl: isVideo ? undefined : (post.imageUrl ?? undefined),
          videoUrl: isVideo ? (post.imageUrl ?? undefined) : undefined,
          hashtags: post.hashtags ?? undefined,
          platform: post.platform,
        });

        if (!result.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error ?? "Failed to publish post",
          });
        }

        await updatePost(input.id, {
          status: "published",
          publishedAt: Date.now(),
        });

        return {
          success: true,
          facebookPostId: result.facebookPostId,
          instagramPostId: result.instagramPostId,
        };
      }),

    // Internal: process all scheduled posts that are due
    processScheduled: protectedProcedure.mutation(async () => {
      const now = Date.now();
      const scheduled = await getScheduledPosts();
      const due = scheduled.filter((p) => p.scheduledAt && p.scheduledAt <= now);

      const results: { id: number; success: boolean; error?: string }[] = [];

      for (const post of due) {
        try {
          const caption = post.captionEs
            ? `${post.captionEn}\n\n🇲🇽 ${post.captionEs}`
            : post.captionEn;

          const isVideo = /\.(mp4|mov|webm|avi)(\?|$)/i.test(post.imageUrl ?? "");
          const result = await postToSocialMedia({
            caption,
            imageUrl: isVideo ? undefined : (post.imageUrl ?? undefined),
            videoUrl: isVideo ? (post.imageUrl ?? undefined) : undefined,
            hashtags: post.hashtags ?? undefined,
            platform: post.platform,
          });

          if (result.success) {
            await updatePost(post.id, { status: "published", publishedAt: Date.now() });
            results.push({ id: post.id, success: true });
          } else {
            results.push({ id: post.id, success: false, error: result.error });
          }
        } catch (err) {
          results.push({
            id: post.id,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return { processed: results.length, results };
    }),

    generate: protectedProcedure
      .input(
        z.object({
          type: z.enum(["menu_item", "special", "event", "promotion", "taco_tuesday", "manual", "borderline_brew"]),
          menuItemId: z.number().optional(),
          specialId: z.number().optional(),
          eventId: z.number().optional(),
          promotionId: z.number().optional(),
          isBilingual: z.boolean().default(false),
          extraContext: z.string().optional(),
          scheduledAt: z.number().optional(),
          platform: z.enum(["facebook", "instagram", "both"]).default("both"),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        let itemName: string | undefined;
        let itemNameEs: string | undefined;
        let description: string | undefined;
        let price: number | undefined;
        let category: string | undefined;
        let relatedId: number | undefined;

        if (input.type === "menu_item" && input.menuItemId) {
          const item = await getMenuItemById(input.menuItemId);
          if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Menu item not found" });
          itemName = item.name;
          itemNameEs = item.nameEs ?? undefined;
          description = item.description ?? undefined;
          price = item.price ?? undefined;
          category = item.category;
          relatedId = item.id;
        } else if (input.type === "special" && input.specialId) {
          const specials = await getActiveSpecials();
          const special = specials.find((s) => s.id === input.specialId);
          if (!special) throw new TRPCError({ code: "NOT_FOUND", message: "Special not found" });
          itemName = special.title;
          itemNameEs = special.titleEs ?? undefined;
          description = special.description ?? undefined;
          price = special.price ?? undefined;
          relatedId = special.id;
        } else if (input.type === "event" && input.eventId) {
          const evts = await getUpcomingEvents();
          const event = evts.find((e) => e.id === input.eventId);
          if (!event) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
          itemName = event.title;
          itemNameEs = event.titleEs ?? undefined;
          description = event.description ?? undefined;
          relatedId = event.id;
        } else if (input.type === "promotion" && input.promotionId) {
          const promos = await getActivePromotions();
          const promo = promos.find((p) => p.id === input.promotionId);
          if (!promo) throw new TRPCError({ code: "NOT_FOUND", message: "Promotion not found" });
          itemName = promo.title;
          itemNameEs = promo.titleEs ?? undefined;
          description = `${promo.description ?? ""} ${promo.requirements ?? ""}`.trim();
          relatedId = promo.id;
        }

        const generated = await generateBilingualPost({
          type: input.type,
          itemName,
          itemNameEs,
          description,
          price,
          category,
          isBilingual: input.isBilingual,
          extraContext: input.extraContext,
        });

        const post = await createPost({
          platform: input.platform,
          captionEn: generated.captionEn,
          captionEs: generated.captionEs || undefined,
          hashtags: generated.hashtags,
          imageUrl: input.imageUrl,
          menuItemId: input.menuItemId,
          postType: input.type,
          status: input.scheduledAt ? "scheduled" : "draft",
          scheduledAt: input.scheduledAt,
          relatedId,
        });

        return { ...generated, post: post ?? { id: 0, status: "draft" as const } };
      }),

    generateTacoTuesday: protectedProcedure
      .input(
        z.object({
          isBilingual: z.boolean().default(true),
          scheduledAt: z.number().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const generated = await generateBilingualPost({
          type: "taco_tuesday",
          isBilingual: input.isBilingual,
        });

        const post = await createPost({
          platform: "both",
          captionEn: generated.captionEn,
          captionEs: generated.captionEs || undefined,
          hashtags: generated.hashtags,
          imageUrl: input.imageUrl,
          postType: "taco_tuesday",
          status: input.scheduledAt ? "scheduled" : "draft",
          scheduledAt: input.scheduledAt,
        });

        return { ...generated, post: post ?? { id: 0, status: "draft" as const } };
      }),

    fillBrewSchedule: protectedProcedure
      .input(z.object({ weeks: z.number().min(1).max(8).default(4) }))
      .mutation(async ({ input }) => {
        // Mon=1, Tue=2, Thu=4, Sat=6 at 13:00 MST (20:00 UTC)
        const POSTING_DAYS = new Set([1, 2, 4, 6]);
        const MST_OFFSET_MS = 7 * 60 * 60 * 1000;
        const now = Date.now();

        // Collect existing brew scheduled slots to avoid duplicates
        const existing = await getScheduledPosts();
        const existingBrewSlots = new Set(
          existing
            .filter(p => p.postType === "borderline_brew")
            .map(p => {
              if (!p.scheduledAt) return null;
              const d = new Date(p.scheduledAt);
              return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
            })
            .filter(Boolean)
        );

        // Generate slots
        const slots: number[] = [];
        const cursor = new Date();
        cursor.setUTCHours(20, 0, 0, 0);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        const maxSlots = input.weeks * 4;

        while (slots.length < maxSlots) {
          const mstDate = new Date(cursor.getTime() - MST_OFFSET_MS);
          const mstDay = mstDate.getDay();
          if (POSTING_DAYS.has(mstDay)) {
            const key = `${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}-${cursor.getUTCDate()}`;
            if (!existingBrewSlots.has(key)) {
              slots.push(cursor.getTime());
            }
          }
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        // Border Boost and Brew post content plan
        const BREW_POSTS = [
          { captionEn: "☕ Good morning, Jackpot! Start your day right with a handcrafted latte from Border Boost and Brew™ inside 4 Jacks Casino. Rich espresso, steamed milk, and your choice of flavors. Come fuel up before you hit the floor!", captionEs: "☕ ¡Buenos días, Jackpot! Comienza tu día con un latte artesanal de Border Boost and Brew™ dentro del Casino 4 Jacks. ¡Espresso rico, leche al vapor y tu elección de sabores!", hashtags: "#BorderBoostAndBrew #CoffeeLover #JackpotNV #4JacksCasino #Latte #MorningCoffee #Espresso", imageKey: 0 },
          { captionEn: "⚡ Need an energy boost? Our Red Bull loaded drinks are the perfect pick-me-up! Custom blends, your favorite flavors, and that extra kick to keep you going. Find us inside 4 Jacks Casino, Jackpot NV!", captionEs: "⚡ ¿Necesitas energía? ¡Nuestras bebidas cargadas de Red Bull son el impulso perfecto! Mezclas personalizadas y tus sabores favoritos. ¡Encuéntranos dentro del Casino 4 Jacks!", hashtags: "#BorderBoostAndBrew #RedBull #EnergyDrink #JackpotNV #4JacksCasino #BoostUp #EnergyBoost", imageKey: 1 },
          { captionEn: "🧋 Treat yourself to one of our specialty blended drinks! Smoothies, frappes, and seasonal creations made fresh to order. Border Boost and Brew™ has something sweet for every mood. Stop by 4 Jacks Casino!", captionEs: "🧋 ¡Date un gusto con una de nuestras bebidas especiales! Smoothies, frappés y creaciones de temporada hechas al momento. ¡Border Boost and Brew™ tiene algo dulce para cada estado de ánimo!", hashtags: "#BorderBoostAndBrew #Smoothie #Frappe #JackpotNV #4JacksCasino #SpecialtyDrinks #BlendedDrinks", imageKey: 2 },
          { captionEn: "☕ Cappuccino perfection! Velvety foam, bold espresso, and just the right balance. Border Boost and Brew™ crafts every cup with care. Pair it with your favorite Sopris Taqueria breakfast and you're set for the day!", captionEs: "☕ ¡Perfección en capuchino! Espuma aterciopelada, espresso intenso y el equilibrio perfecto. ¡Combínalo con tu desayuno favorito de Sopris Taqueria!", hashtags: "#BorderBoostAndBrew #Cappuccino #CoffeeCraft #JackpotNV #4JacksCasino #MorningVibes #CoffeeAndFood", imageKey: 3 },
          { captionEn: "⚡ Double the energy, double the fun! Our loaded energy drinks come in dozens of flavor combinations. Mix Red Bull with your favorite juice, syrup, or cream. Custom drinks made YOUR way at Border Boost and Brew™!", captionEs: "⚡ ¡Doble energía, doble diversión! Nuestras bebidas energéticas vienen en docenas de combinaciones de sabores. ¡Bebidas personalizadas a TU manera en Border Boost and Brew™!", hashtags: "#BorderBoostAndBrew #LoadedEnergyDrink #CustomDrinks #JackpotNV #4JacksCasino #RedBullLoaded", imageKey: 4 },
          { captionEn: "🌅 Rise and grind, Jackpot! Border Boost and Brew™ opens early so you can fuel up before your day begins. Hot espresso drinks, cold blends, and everything in between. See you at 4 Jacks Casino!", captionEs: "🌅 ¡Levántate y brilla, Jackpot! Border Boost and Brew™ abre temprano para que puedas recargar energías antes de comenzar tu día. ¡Hasta luego en el Casino 4 Jacks!", hashtags: "#BorderBoostAndBrew #EarlyBird #MorningCoffee #JackpotNV #4JacksCasino #RiseAndGrind #CoffeeTime", imageKey: 5 },
          { captionEn: "🍵 Matcha lovers, this one's for you! Our creamy matcha latte is made with premium matcha powder and your choice of milk. Earthy, smooth, and absolutely delicious. Available now at Border Boost and Brew™!", captionEs: "🍵 ¡Amantes del matcha, este es para ustedes! Nuestro latte de matcha cremoso está hecho con polvo de matcha premium. ¡Terroso, suave y absolutamente delicioso!", hashtags: "#BorderBoostAndBrew #MatchaLatte #Matcha #JackpotNV #4JacksCasino #GreenTea #HealthyDrinks", imageKey: 6 },
          { captionEn: "☕ The perfect combo: a hot latte from Border Boost and Brew™ + street tacos from Sopris Taqueria. Two great brands, one amazing location inside 4 Jacks Casino, Jackpot NV. Come experience both!", captionEs: "☕ La combinación perfecta: un latte caliente de Border Boost and Brew™ + tacos de la calle de Sopris Taqueria. ¡Dos marcas increíbles, una ubicación increíble!", hashtags: "#BorderBoostAndBrew #SoprisTaqueria #JackpotNV #4JacksCasino #CoffeeAndTacos #BestCombo", imageKey: 7 },
        ];

        // Image assets for brew posts (use food images from catalog as placeholders)
        const BREW_IMAGES = [
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_carne_asada_eggs_1141c375.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_birria_tacos_dd99ef8e.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_chocolate_oreo_sundae_v2_f15a7f25.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_street_tacos_c4a8bb9d.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_1_8a0b7ea8.mp4",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_chicken_fajitas_a1b34c9f.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_post_fajita_trio_98ae6a2d.jpg",
          "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/sopris_promo_2_6cc6d35a.mp4",
        ];

        let created = 0;
        for (let i = 0; i < slots.length; i++) {
          const plan = BREW_POSTS[i % BREW_POSTS.length];
          const imageUrl = BREW_IMAGES[plan.imageKey % BREW_IMAGES.length];
          await createPost({
            platform: "both",
            captionEn: plan.captionEn,
            captionEs: plan.captionEs,
            hashtags: plan.hashtags,
            imageUrl,
            postType: "borderline_brew",
            status: "scheduled",
            scheduledAt: slots[i],
          });
          created++;
        }

        return { created, slots: slots.length };
      }),
  }),

  // ─── Specials ────────────────────────────────────────────────────────────────
  specials: router({
    list: protectedProcedure.query(() => getAllSpecials()),
    active: protectedProcedure.query(() => getActiveSpecials()),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          titleEs: z.string().optional(),
          description: z.string().optional(),
          descriptionEs: z.string().optional(),
          price: z.number().optional(),
          validFrom: z.number().optional(),
          validTo: z.number().optional(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => createSpecial(input)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSpecial(input.id)),
  }),

  // ─── Events ──────────────────────────────────────────────────────────────────
  events: router({
    list: protectedProcedure.query(() => getAllEvents()),
    upcoming: protectedProcedure.query(() => getUpcomingEvents()),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          titleEs: z.string().optional(),
          description: z.string().optional(),
          descriptionEs: z.string().optional(),
          eventDate: z.number(),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => createEvent(input)),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteEvent(input.id)),
  }),

  // ─── Promotions ───────────────────────────────────────────────────────────────
  promotions: router({
    list: protectedProcedure.query(() => getAllPromotions()),
    active: protectedProcedure.query(() => getActivePromotions()),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(({ input }) => togglePromotion(input.id, input.isActive)),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          titleEs: z.string().optional(),
          description: z.string().optional(),
          descriptionEs: z.string().optional(),
          discountValue: z.string().optional(),
          requirements: z.string().optional(),
          requirementsEs: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updatePromotion(id, data);
      }),
  }),

  // ─── Food Photos ─────────────────────────────────────────────────────────────
  photos: router({
    list: protectedProcedure.query(() => getAllFoodPhotos()),
    byMenuItem: protectedProcedure
      .input(z.object({ menuItemId: z.number() }))
      .query(({ input }) => getFoodPhotosByMenuItem(input.menuItemId)),
    upload: protectedProcedure
      .input(
        z.object({
          filename: z.string(),
          contentType: z.string(),
          base64Data: z.string(),
          caption: z.string().optional(),
          menuItemId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const fileKey = `sopris-photos/${nanoid()}-${input.filename}`;
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        await createFoodPhoto({
          url,
          fileKey,
          caption: input.caption,
          menuItemId: input.menuItemId,
        });
        return { url, fileKey };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteFoodPhoto(input.id)),
    bulkImportFromUrls: protectedProcedure
      .input(
        z.object({
          photos: z.array(z.object({
            url: z.string(),
            fileKey: z.string(),
            caption: z.string().optional(),
          }))
        })
      )
      .mutation(async ({ input }) => {
        let imported = 0;
        for (const photo of input.photos) {
          await createFoodPhoto({ url: photo.url, fileKey: photo.fileKey, caption: photo.caption });
          imported++;
        }
        return { imported };
      }),
  }),

  // ─── Settings ────────────────────────────────────────────────────────────────
  settings: router({
    testFacebookToken: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const pageId = ENV.facebookPageId || "1099719276547374";
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=name,id&access_token=${input.token}`
          );
          const data = await response.json() as { name?: string; id?: string; error?: { message: string } };
          if (data.error) {
            return { valid: false, error: data.error.message };
          }
          return { valid: true, pageName: data.name, pageId: data.id };
        } catch (err: unknown) {
          return { valid: false, error: String(err) };
        }
      }),
    updateSocialCredentials: protectedProcedure
      .input(
        z.object({
          facebookApiToken: z.string(),
          facebookPageId: z.string().optional(),
          instagramBusinessAccountId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Update the in-memory ENV so the scheduler picks it up immediately
        process.env.FACEBOOK_API_TOKEN = input.facebookApiToken;
        (ENV as unknown as Record<string, string>).facebookApiToken = input.facebookApiToken;
        if (input.facebookPageId) {
          process.env.FACEBOOK_PAGE_ID = input.facebookPageId;
          (ENV as unknown as Record<string, string>).facebookPageId = input.facebookPageId;
        }
        if (input.instagramBusinessAccountId) {
          process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID = input.instagramBusinessAccountId;
          (ENV as unknown as Record<string, string>).instagramBusinessAccountId = input.instagramBusinessAccountId;
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
