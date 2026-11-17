import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Building2, Mail, Layers, Users, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Step {
  id: string;
  title: string;
  hint: string;
}

interface Highlight {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface SetupValues {
  workspace: string;
  email: string;
}

type SetupErrors = Partial<Record<keyof SetupValues, string | undefined>>;

interface SetupWizardProps {
  onComplete?: (data: SetupValues) => void;
}

/* ------------------------------------------------------------------ */
/* Dummy data — swap for your own                                      */
/* ------------------------------------------------------------------ */
const APP_NAME = "Meridian";

const STEPS: Step[] = [
  { id: "welcome", title: "Welcome", hint: "Get oriented" },
  { id: "details", title: "Your details", hint: "Tell us who you are" },
  { id: "ready", title: "Ready", hint: "Start working" },
];

const HIGHLIGHTS: Highlight[] = [
  { icon: Layers, title: "One place for every project", text: "Plans, files and conversations stay together, so nothing gets lost between tools." },
  { icon: Users, title: "Built for teams of any size", text: "Invite people when you are ready. Permissions are simple to set and easy to change." },
  { icon: ShieldCheck, title: "Private by default", text: "Your workspace is visible only to the people you add." },
];

/* ------------------------------------------------------------------ */
/* Chevron stepper                                                     */
/* ------------------------------------------------------------------ */
const POINT = 16; // depth of the chevron point in px

function chevronClip(index: number, total: number): string {
  const first = index === 0;
  const last = index === total - 1;
  const topRight = last ? "100% 0" : `calc(100% - ${POINT}px) 0`;
  const bottomRight = last ? "100% 100%" : `calc(100% - ${POINT}px) 100%`;
  const tip: string[] = last ? [] : ["100% 50%"];
  const notch: string[] = first ? [] : [`${POINT}px 50%`];
  const pts = ["0 0", topRight, ...tip, bottomRight, "0 100%", ...notch];
  return `polygon(${pts.join(", ")})`;
}

interface ChevronStepperProps {
  steps: Step[];
  current: number;
}

function ChevronStepper({ steps, current }: ChevronStepperProps) {
  return (
    <nav aria-label="Setup progress">
      <ol className="flex w-full">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={`relative flex h-14 flex-1 items-center transition-colors duration-300 ${i > 0 ? "-ml-[12px]" : ""} ${
                done
                  ? "bg-[#3345D6] text-white"
                  : active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
              style={{
                clipPath: chevronClip(i, steps.length),
                paddingLeft: i === 0 ? 20 : POINT + 14,
                paddingRight: i === steps.length - 1 ? 16 : POINT + 8,
              }}
            >
              <span
                className={`mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-white/20 text-white"
                    : active
                    ? "bg-white text-slate-900"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-medium">{step.title}</span>
                <span className={`hidden truncate text-xs sm:block ${done || active ? "text-white/65" : "text-slate-400"}`}>
                  {step.hint}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */
function WelcomeStep() {
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Welcome to {APP_NAME}
      </h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
        Setting up takes about a minute. You will name your workspace, add your work email, and
        then you are in.
      </p>

      <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4 py-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3345D6]/10 text-[#3345D6]">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-medium text-slate-900">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface DetailsStepProps {
  values: SetupValues;
  onChange: (key: keyof SetupValues, value: string) => void;
  errors: SetupErrors;
}

function DetailsStep({ values, onChange, errors }: DetailsStepProps) {
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Tell us about your workspace</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
        You can change both of these later in settings.
      </p>

      <div className="mt-8 grid max-w-lg gap-6">
        <div className="grid gap-2">
          <Label htmlFor="workspace" className="text-slate-800">Workspace name</Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="workspace"
              value={values.workspace}
              onChange={(e) => onChange("workspace", e.target.value)}
              placeholder="Acme Studio"
              aria-invalid={!!errors.workspace}
              aria-describedby="workspace-help"
              className="h-11 pl-10"
              autoFocus
            />
          </div>
          <p id="workspace-help" className={`text-sm ${errors.workspace ? "text-red-600" : "text-slate-500"}`}>
            {errors.workspace || "Usually your company or team name."}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-slate-800">Work email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="you@acme.com"
              aria-invalid={!!errors.email}
              aria-describedby="email-help"
              className="h-11 pl-10"
            />
          </div>
          <p id="email-help" className={`text-sm ${errors.email ? "text-red-600" : "text-slate-500"}`}>
            {errors.email || "We will send receipts and security notices here."}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ReadyStepProps {
  values: SetupValues;
}

function ReadyStep({ values }: ReadyStepProps) {
  return (
    <div>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3345D6] text-white shadow-[0_8px_24px_-8px_rgba(51,69,214,0.7)]">
        <Check className="h-6 w-6" strokeWidth={3} />
      </span>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {values.workspace || "Your workspace"} is ready
      </h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
        Everything is set up. Open your workspace to create your first project.
      </p>

      <dl className="mt-8 max-w-lg divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Workspace</dt>
          <dd className="truncate text-sm font-medium text-slate-900">{values.workspace || "Acme Studio"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Email</dt>
          <dd className="truncate text-sm font-medium text-slate-900">{values.email || "you@acme.com"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <dt className="text-sm text-slate-500">Plan</dt>
          <dd className="text-sm font-medium text-slate-900">Free trial, 14 days</dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */
export default function SetupWizard({ onComplete = (data) => console.log("Setup complete", data) }: SetupWizardProps) {
  const [step, setStep] = useState<number>(0);
  const [values, setValues] = useState<SetupValues>({ workspace: "", email: "" });
  const [errors, setErrors] = useState<SetupErrors>({});

  const isLast = step === STEPS.length - 1;

  const handleChange = (key: keyof SetupValues, val: string) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: SetupErrors = {};
    if (!values.workspace.trim()) next.workspace = "Enter a workspace name to continue.";
    if (!values.email.trim()) next.email = "Enter your work email to continue.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email, like you@acme.com.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validate()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)]">
        {/* Stepper */}
        <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
          <ChevronStepper steps={STEPS} current={step} />
        </div>

        {/* Body */}
        <div key={step} className="min-h-[420px] px-6 py-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 sm:px-10 sm:py-10">
          {step === 0 && <WelcomeStep />}
          {step === 1 && <DetailsStep values={values} onChange={handleChange} errors={errors} />}
          {step === 2 && <ReadyStep values={values} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:px-10">
          <Button
            variant="ghost"
            onClick={goBack}
            className={step === 0 ? "invisible" : "text-slate-600"}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={isLast ? () => onComplete(values) : goNext}
            className="h-11 bg-[#3345D6] px-6 text-white hover:bg-[#2A3AB8] focus-visible:ring-[#3345D6]/40"
          >
            {step === 0 && "Get started"}
            {step === 1 && "Continue"}
            {isLast && "Open workspace"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}