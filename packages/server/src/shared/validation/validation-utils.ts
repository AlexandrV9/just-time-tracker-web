interface FieldError {
  name: string;
  expected: string;
  code: string;
  message: string;
}

type ZodError = {
  expected: string;
  code: string;
  path: string[];
  message: string;
  received: string | undefined;
};

const convertZodErrorToFieldError = (zodError: ZodError): FieldError => {
  return {
    name: zodError.path[0],
    expected: zodError.expected,
    code: zodError.code,
    message: zodError.message,
  };
};

const formatZodErrors = (errorMessage: string): FieldError[] => {
  try {
    const zodErrors = JSON.parse(errorMessage) as ZodError[];
    const fieldErrors = zodErrors.map(convertZodErrorToFieldError);
    return fieldErrors;
  } catch {
    return [];
  }
};

export const validationUtils = {
  convertZodErrorToFieldError,
  formatZodErrors,
};
