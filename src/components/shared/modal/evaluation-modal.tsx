import { useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { IconLock } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/password-input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuthorizeEvaluation } from "@/hooks/use-evaluation";
import type { EvaluationUser } from "@/models/evaluation-model";

const getSchema = (t: any) =>
  z.object({
    evaluation_password: z
      .string()
      .nonempty({ message: t("evaluation_password_req") }),
  });

type EvaluationForm = z.infer<ReturnType<typeof getSchema>>;

interface Props {
  open: boolean;
  onClose: () => void;
  // Runs after the password is accepted, with the admin who approved it.
  onSuccess?: (user: EvaluationUser) => void;
}

export function EvaluationModal({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const { mutate: authorize, isPending } = useAuthorizeEvaluation();

  const schema = useMemo(() => getSchema(t), [t]);

  const form = useForm<EvaluationForm>({
    resolver: zodResolver(schema),
    defaultValues: { evaluation_password: "" },
  });

  // Reset and close. Used after a successful authorization.
  const finish = () => {
    form.reset(); // never keep the password around
    onClose();
  };

  // User-initiated close (Cancel, Esc, overlay click).
  // Ignored while the request is in flight, so a cancelled attempt
  // can't trigger the main action afterwards.
  const handleCancel = () => {
    if (!isPending) finish();
  };

  const onSubmit = (values: EvaluationForm) => {
    authorize(values, {
      onSuccess: (res) => {
        // The API nests a second envelope: the user is at res.data.data
        onSuccess?.(res.data.data); // run the main action first...
        finish(); // ...then close
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <IconLock className="size-5" />
            </div>
            {t("evaluation_password")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="evaluation-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="evaluation_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("evaluation_password")}</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>

          <Button type="submit" form="evaluation-form" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner variant="circle" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}