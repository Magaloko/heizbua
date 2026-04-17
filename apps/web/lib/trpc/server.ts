import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

export const createServerClient = async () => {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
};
