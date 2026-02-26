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
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

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
  }),
});

export type AppRouter = typeof appRouter;
