import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import z from "zod";
import { authManager } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Field,
  Input,
  Link,
  Stack,
  Text,
  toast,
  useForm,
} from "~/shared/ui";

import styles from "./SignUpForm.module.css";
import { minLengthPassword, signUpFormSchema } from "./constants";

const baseLocale = "features.auth.signUpForm";

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;

export const SignUpForm = () => {
  const { t } = useTranslation();

  const signUpMutatuin = useMutation({
    mutationFn: (data: SignUpFormSchema) => authManager.signUp(data),
    onSuccess: () => {
      toast.success("Success", {
        position: "top-center",
        draggable: true,
        toastId: "error_sign_up",
      });
      reset();
    },
    onError: (error) => {
      toast.success("Success", {
        position: "top-center",
        draggable: true,
        toastId: "error_sign_up",
      });
      console.log("error", error);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      login: "",
      password: "",
      repeatPassword: "",
    },
  });

  const submitHandler = handleSubmit((data) => {
    signUpMutatuin.mutate(data);
  });

  return (
    <Box
      as="form"
      display="flex"
      flexDirection="column"
      gap="1rem"
      onSubmit={submitHandler}
    >
      <Text
        as="h1"
        textStyle="4xl"
        m={0}
        fontWeight="semibold"
        // bg="linear-gradient(135deg, #7ea670ff 20%, #8307fe 40%, #07fe66ff 70%)"
        // bgClip="text"
        className={styles.shineText}
      >
        {t(`${baseLocale}.title`)}
      </Text>

      <Field.Root invalid={!!errors.firstName}>
        <Field.Label color="fg">
          {t(`${baseLocale}.firstNameInput.label`)}
        </Field.Label>
        <Input
          truncate
          color="fg"
          placeholder={t(`${baseLocale}.firstNameInput.placeholder`)}
          autoComplete="false"
          {...register("firstName")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.firstName?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.login}>
        <Field.Label color="fg">
          {t(`${baseLocale}.loginInput.label`)}
        </Field.Label>
        <Input
          truncate
          placeholder={t(`${baseLocale}.loginInput.placeholder`)}
          autoComplete="off"
          {...register("login")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.login?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.password}>
        <Field.Label color="fg">
          {t(`${baseLocale}.passwordInput.label`)}
        </Field.Label>
        <Input.Password
          color="fg"
          truncate
          autoComplete="off"
          paddingRight="52px !important" // TODO: убрать это и сделать иначе
          placeholder={t(`${baseLocale}.passwordInput.placeholder`)}
          {...register("password")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.password?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.repeatPassword}>
        <Field.Label color="fg">
          {t(`${baseLocale}.repeatPasswordInput.label`)}
        </Field.Label>
        <Input.Password
          color="fg"
          truncate
          autoComplete="off"
          paddingRight="52px !important" // TODO: убрать это и сделать иначе
          placeholder={t(`${baseLocale}.repeatPasswordInput.placeholder`)}
          {...register("repeatPassword")}
        />
        <Field.ErrorText color="fg.error">
          {getTranslatedError(t, errors.repeatPassword?.message)}
        </Field.ErrorText>
      </Field.Root>

      <Button
        mt="1rem"
        type="submit"
        loading={signUpMutatuin.isPending}
        loadingText={t(`${baseLocale}.submitButtonLoadingText`)}
      >
        {t(`${baseLocale}.submitButton`)}
      </Button>

      <Stack.HStack justify="center">
        <Text fontWeight="medium" color="fg">
          <Text as="span" mr="5px">
            {t(`${baseLocale}.subtitleText`)}
          </Text>
          <Text asChild color="purple.500" fontWeight="600">
            <Link to="/signin">{t(`${baseLocale}.linkText`)}</Link>
          </Text>
        </Text>
      </Stack.HStack>

      Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias delectus omnis commodi, aperiam reprehenderit esse est maxime necessitatibus corrupti repellendus? Excepturi dolorum saepe mollitia recusandae possimus autem quis, praesentium consequatur?
      Delectus deserunt quas eligendi possimus ad. Architecto necessitatibus quam corporis velit neque dolores minima molestias nam vero sed aperiam doloribus laborum iusto minus ipsum, pariatur adipisci porro alias delectus amet.
      Ad, cupiditate corrupti. Repudiandae dolorum tenetur blanditiis ratione autem id porro. Laborum assumenda incidunt, quis amet saepe cupiditate repudiandae ex cum accusamus delectus aut quam modi alias! Fugit, aut nemo!
      Ut enim harum, a iusto voluptas soluta necessitatibus id. Quaerat minus magnam ipsam. Quisquam unde quaerat sunt minima obcaecati a consequuntur nisi animi, cupiditate reprehenderit quasi aliquam ex doloribus nobis?
      Et saepe dolore vitae deserunt dolor sapiente, repellat odio obcaecati vero odit aliquid accusamus tempore sed provident aperiam nostrum eaque, optio debitis atque accusantium dicta repellendus dolorem? Quia, deserunt ipsum.
      Veniam repellendus placeat magnam quis nostrum, exercitationem dolorum. Alias neque voluptatibus atque cupiditate nemo est nam iusto ab sunt maxime sint voluptatum earum porro obcaecati, a nisi dolorum, at eius!
      Totam sint debitis unde commodi architecto tempore cupiditate nam. Illo id eveniet, eos sed accusamus corrupti esse facere perspiciatis iusto repellendus mollitia saepe nulla tempora pariatur, porro eum molestiae explicabo?
      Nesciunt magnam odio sequi, harum ratione, voluptates molestias totam officiis dolorem corporis, reprehenderit ad distinctio? Odio tenetur corporis explicabo dolorem, nihil deleniti maiores totam obcaecati in aliquid modi voluptatibus neque.
      Ab soluta aliquam, cumque numquam rem doloremque dolor laboriosam sapiente cupiditate obcaecati libero cum similique! Harum quia placeat doloremque accusantium officia autem dolore, nobis rerum consectetur eaque nisi. Odit, neque.
      Earum beatae sapiente inventore repudiandae id dolor pariatur aspernatur maiores, similique molestias quod ad aut corrupti omnis repellat, incidunt libero a laboriosam ipsum odio, quibusdam voluptates nostrum? Esse, laborum sequi.
    </Box>
  );
};

function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined,
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "firstName.error.required":
      return t(`${baseLocale}.firstNameInput.errors.required`);
    case "login.error.required":
      return t(`${baseLocale}.loginInput.errors.required`);
    case "password.error.minLength":
      return t(`${baseLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    case "passwords.mismatch":
      return t(`${baseLocale}.repeatPasswordInput.errors.mismatch`, {
        count: minLengthPassword,
      });
    case "repeatPassword.error.required":
      return t(`${baseLocale}.repeatPasswordInput.errors.required`, {
        count: minLengthPassword,
      });
    default: {
      return undefined;
    }
  }
}
