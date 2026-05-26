import type { Context } from "hono";
import { validationUtils } from "../validation/validation-utils.js";
import type z from "zod";
import type {
  ContentfulStatusCode,
  SuccessStatusCode,
} from "hono/utils/http-status";

export const respondValidationError = (c: Context, errorMessage: string) =>
  c.json(
    {
      success: false,
      message: "Validation failed",
      data: validationUtils.formatZodErrors(errorMessage),
    },
    400,
  );

export const respondInternalError = (c: Context) =>
  c.json(
    {
      success: false,
      message: "Internal server error",
    },
    500,
  );

type HandlerConfig<TParsed, TValidated, TInput> = {
  parse: (c: Context) => TParsed | Promise<TParsed>;
  schema: z.ZodType<TValidated>;
  service: (input: TInput) => Promise<unknown>;
  map?: (data: TValidated) => TInput;
  successStatus?: SuccessStatusCode;
};

/** Axios may send `key[]=`; Hono matches query keys literally — both forms are merged. */
export const getArrayQueryParam = (c: Context, key: string): string[] => [
  ...new Set([
    ...(c.req.queries(key) ?? []),
    ...(c.req.queries(`${key}[]`) ?? []),
  ]),
];

export type HandlerJsonResult = {
  json: unknown;
  status: ContentfulStatusCode;
};

export const handlerJson = (
  json: unknown,
  status: ContentfulStatusCode = 200,
): HandlerJsonResult => ({ json, status });

export const isHandlerJsonResult = (
  value: unknown,
): value is HandlerJsonResult =>
  typeof value === "object" &&
  value !== null &&
  "json" in value &&
  "status" in value;

export const createValidatedHandler =
  <TParsed, TValidated, TInput = TValidated>({
    parse,
    schema,
    service,
    map,
    successStatus = 200,
  }: HandlerConfig<TParsed, TValidated, TInput>) =>
  async (c: Context) => {
    const result = schema.safeParse(await Promise.resolve(parse(c)));
    if (!result.success) {
      return respondValidationError(c, result.error.message);
    }

    const input = map ? map(result.data) : (result.data as unknown as TInput);

    try {
      const responseData = await service(input);

      if (isHandlerJsonResult(responseData)) {
        return c.json(responseData.json as any, responseData.status);
      }

      return c.json(responseData as any, successStatus as any);
    } catch (error) {
      console.error("Handler error:", error);

      return respondInternalError(c);
    }
  };
