import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@heizbua/db";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = async () => {
  const { userId, sessionClaims } = await auth();
  return {
    prisma,
    userId,
    role: (sessionClaims?.metadata as { role?: string } | null)?.role ?? null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || ctx.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
