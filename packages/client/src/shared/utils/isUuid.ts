import { z } from "zod";

const uuidSchema = z.uuid();

export const isUuid = (value: string) => uuidSchema.safeParse(value).success;
