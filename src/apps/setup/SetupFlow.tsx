import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "@tanstack/react-router";
import { 
  ArrowRight, 
  Check, 
  GlobeIcon, 
  KeyRoundIcon, 
  Sparkles,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  WifiIcon,
  CheckIcon,
  LogInIcon,
  ArrowLeftIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useConfigurePos } from "@/hooks/use-pos-config";
import { POS_TOKEN_LENGTH, brandButtonClass, maskToken, type ConfigValues } from "./setup-config";

/* ----------------------------- schema & types ----------------------------- */
const configSchema = z.object({
  base_url: z.string().url({ message: "Please enter a valid URL" }),
  pos_token: z.string().min(POS_TOKEN_LENGTH, { message: `POS token must be exactly ${POS_TOKEN_LENGTH} characters.` }),
});

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "configuration", title: "Configuration" },
  { id: "ready", title: "Ready" },
] as const;

interface SetupFlowProps {
  onComplete?: (values: ConfigValues) => void;
  onGoToLogin?: () => void;
}

interface ChevronStepperProps {
  steps: typeof STEPS;
  current: number;
  onSelect: (index: number) => void;
}

/* ------------------------- chevron stepper bar ------------------------- */
const ARROW = 16;
const GAP = 4;

function chevronClip(isFirst: boolean, isLast: boolean): string {
  const left = isFirst ? "0 0" : `${ARROW}px 50%`;
  const leftTop = "0 0";
  const leftBottom = "0 100%";
  const right = isLast ? "100% 50%" : `100% 50%`;
  const rightTop = isLast ? "100% 0" : `calc(100% - ${ARROW}px) 0`;
  const rightBottom = isLast ? "100% 100%" : `calc(100% - ${ARROW}px) 100%`;
  if (isFirst && isLast) return "none";
  if (isFirst)
    return `polygon(${leftTop}, ${rightTop}, ${right}, ${rightBottom}, ${leftBottom})`;
  if (isLast)
    return `polygon(${leftTop}, 100% 0, 100% 100%, ${leftBottom}, ${left})`;
  return `polygon(${leftTop}, ${rightTop}, ${right}, ${rightBottom}, ${leftBottom}, ${left})`;
}

function ChevronStepper({ steps, current, onSelect }: ChevronStepperProps) {
  return (
    <ol className="flex w-full" aria-label="Setup progress">
      {steps.map((s, i) => {
        const isLastStep = i === steps.length - 1;
        const done = i < current || (isLastStep && current === i);
        const active = i === current && !isLastStep;
        const isFirst = i === 0;
        const isLast = isLastStep;

        const content = (
          <>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                done && "bg-white/20 text-white",
                !done && active && "bg-white text-[#3E4FD6]",
                !done && !active && "bg-foreground/10 text-muted-foreground"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("truncate", !active && "hidden sm:inline")}>{s.title}</span>
          </>
        );

        const className = cn(
          "flex h-14 w-full items-center justify-center gap-2.5 text-sm font-medium transition-colors duration-300",
          done && "bg-[#0E1B2C] text-white hover:bg-[#16283F]",
          !done && active && "bg-[#6C7BFF] text-white",
          !done && !active && "bg-muted text-muted-foreground"
        );

        const style: CSSProperties = {
          clipPath: chevronClip(isFirst, isLast),
          paddingLeft: isFirst ? 16 : ARROW + 8,
          paddingRight: isLast ? 16 : ARROW + 4,
        };

        return (
          <li
            key={s.id}
            className="relative min-w-0 flex-1"
            style={{ marginLeft: isFirst ? 0 : -(ARROW - GAP), zIndex: steps.length - i }}
            aria-current={active ? "step" : undefined}
          >
            {done ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  className,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                )}
                style={style}
              >
                {content}
                <span className="sr-only">(completed, go back)</span>
              </button>
            ) : (
              <div className={className} style={style}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ component ------------------------------ */
export default function SetupFlow({ onComplete, onGoToLogin }: SetupFlowProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  
  // React Hook Form with Zod validation resolver
  const form = useForm<ConfigValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      base_url: "",
      pos_token: "",
    },
  });

  const [showToken, setShowToken] = useState<boolean>(false);
  const [testPassed, setTestPassed] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const configurePosMutation = useConfigurePos();
  const isPending = isTesting || isSaving;

  const requirements = [
    {
      icon: GlobeIcon,
      title: t('backoffice_address'),
      text: t('backoffice_address_description'),
    },
    {
      icon: KeyRoundIcon,
      title: t('pos_token'),
      text: t('pos_token_description', { length: POS_TOKEN_LENGTH }),
    },
  ];

  const next = () => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleTestConnection = async () => {
    const isValid = await form.trigger(["base_url", "pos_token"]);
    if (!isValid) return;

    setIsTesting(true);
    setTestPassed(false);
    try {
      const values = form.getValues();
      await configurePosMutation.mutateAsync({
        payload: {
          base_url: values.base_url,
          pos_token: values.pos_token,
        },
        save: false,
      });
      setTestPassed(true);
    } catch {
      setTestPassed(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfiguration = async (values: ConfigValues) => {
    setIsSaving(true);
    try {
      await configurePosMutation.mutateAsync({
        payload: {
          base_url: values.base_url,
          pos_token: values.pos_token,
        },
        save: true,
      });
      onComplete?.(values);
      next();
    } catch {
      // Error toasts/handling are managed inside useConfigurePos store hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      router.navigate({ to: '/sign-in' });
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      {/* ------------------------- LEFT: background image ------------------------- */}
      <div
        className="relative hidden bg-cover bg-center bg-no-repeat md:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562426509-5044a121aa49?w=2400&q=90&auto=format&fit=crop')",
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-black/40" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Acme</span>
          </div>

          <div className="max-w-sm space-y-3 text-white">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('left_banner_title', { defaultValue: "Everything your team needs, in one place." })}
            </h2>
            <p className="text-sm leading-relaxed text-white/70">
              {t('left_banner_description', { defaultValue: "Projects, files and conversations live side by side. Set up your workspace in under a minute." })}
            </p>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Acme. All rights reserved.
          </p>
        </div>
      </div>

      {/* ------------------------- RIGHT: stepper + centered content ------------------------- */}
      <div className="flex min-h-screen flex-col bg-background">
        <header className="relative w-full">
          <ChevronStepper steps={STEPS} current={step} onSelect={setStep} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
          <div
            key={step}
            className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 motion-reduce:animate-none"
          >
            {/* ------------------------- STEP 0: WELCOME ------------------------- */}
            {step === 0 && (
              <section className="space-y-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {t('pos_setup_title')}
                  </h1>
                  <p className="mt-3 text-muted-foreground">
                    {t('pos_setup_requirements')}
                  </p>
                </div>
                <ul className="space-y-3">
                  {requirements.map(({ icon: Icon, title, text }) => (
                    <li key={title} className='flex items-start gap-4 rounded-2xl border bg-card p-4'>
                      <span className='bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
                        <Icon className='h-5 w-5' />
                      </span>
                      <div>
                        <p className='text-foreground text-sm font-semibold'>{title}</p>
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                          {text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div>
                  <Button size="lg" onClick={next} className={cn(brandButtonClass, "w-full")}>
                    {t('start_setup')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            )}

            {/* ------------------------- STEP 1: CONFIGURATION ------------------------- */}
            {step === 1 && (
              <section className="space-y-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {t('backoffice_configuration')}
                  </h1>
                  <p className="mt-3 text-muted-foreground">
                    {t('configuration_intro')}
                  </p>
                </div>

                <Form {...form}>
                  <form
                    noValidate
                    onSubmit={form.handleSubmit(handleSaveConfiguration)}
                    className='space-y-6'
                  >
                    <FormField
                      control={form.control}
                      name='base_url'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('backoffice_url')}</FormLabel>
                          <div className='relative'>
                            <GlobeIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                            <FormControl>
                              <Input
                                type='text'
                                inputMode='url'
                                placeholder='http://192.168.1.10:8008'
                                autoComplete='off'
                                className='h-11 pl-9'
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='pos_token'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('pos_token')}</FormLabel>
                          <div className='relative'>
                            <KeyRoundIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                            <FormControl>
                              <Input
                                type={showToken ? 'text' : 'password'}
                                placeholder={t('enter_pos_token')}
                                maxLength={POS_TOKEN_LENGTH}
                                autoComplete='off'
                                spellCheck={false}
                                className='h-11 px-9 font-mono tracking-widest'
                                {...field}
                              />
                            </FormControl>
                            <button
                              type='button'
                              onClick={() => setShowToken((v) => !v)}
                              aria-label={showToken ? t('hide_token') : t('show_token')}
                              className='text-muted-foreground hover:text-foreground focus-visible:ring-primary/40 absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2'
                            >
                              {showToken ? (
                                <EyeOffIcon className='size-4' />
                              ) : (
                                <EyeIcon className='size-4' />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {testPassed && (
                      <Badge
                        variant='success'
                        role='status'
                        className='h-auto w-full justify-start gap-2 whitespace-normal rounded-lg px-3.5 py-2.5 text-sm font-medium [&>svg]:size-4'
                      >
                        <CheckIcon strokeWidth={3} />
                        {t('connection_successful_save')}
                      </Badge>
                    )}

                    <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center'>
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={back}
                        disabled={isPending}
                        className='h-11 sm:mr-auto'
                      >
                        <ArrowLeftIcon className='size-4' /> {t('back')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleTestConnection}
                        disabled={isPending}
                        className='h-11 font-semibold'
                      >
                        {isTesting ? (
                          <Loader2Icon className='size-4 animate-spin' />
                        ) : (
                          <WifiIcon className='size-4' />
                        )}
                        {t('test_connection')}
                      </Button>
                      <Button
                        type='submit'
                        disabled={isPending}
                        className={cn(brandButtonClass, 'flex-1')}
                      >
                        {isSaving && <Loader2Icon className='size-4 animate-spin' />}
                        {t('validate_and_save')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </section>
            )}

            {/* ------------------------- STEP 2: CONFIRMATION / READY ------------------------- */}
            {step === 2 && (
              <section className="space-y-8">
                <div className="space-y-5 text-center">
                  <span className='mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 ring-8 ring-emerald-500/20 dark:text-emerald-400'>
                    <CheckIcon className='size-7' strokeWidth={2.5} />
                  </span>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {t('pos_configured_successfully')}
                    </h1>
                  </div>
                </div>

                <dl className='divide-border border-border divide-y rounded-xl border text-sm bg-card'>
                  <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
                    <dt className='text-muted-foreground'>{t('backoffice_url')}</dt>
                    <dd className='truncate font-mono text-xs font-semibold'>
                      {form.getValues("base_url")}
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
                    <dt className='text-muted-foreground'>{t('pos_token')}</dt>
                    <dd className='font-mono text-xs font-semibold tracking-widest'>
                      {maskToken(form.getValues("pos_token"))}
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-4 px-4 py-3.5'>
                    <dt className='text-muted-foreground'>{t('status')}</dt>
                    <dd className='flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400'>
                      <span className='size-2 rounded-full bg-emerald-500' />{' '}
                      {t('connected_and_verified')}
                    </dd>
                  </div>
                </dl>

                <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center'>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={back}
                    className='h-11 sm:mr-auto'
                  >
                    <ArrowLeftIcon className='size-4' /> {t('back')}
                  </Button>
                  <Button
                    type='button'
                    onClick={handleGoToLogin}
                    className={cn(brandButtonClass, 'flex-1')}
                  >
                    <LogInIcon className='size-4' /> {t('go_to_login')}
                  </Button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}