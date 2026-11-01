import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { add, format } from "date-fns";
import { type Locale, enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import * as React from "react";
import { useImperativeHandle, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";

// ============================================================
// shared types
// ============================================================

type Granularity = "day" | "hour" | "minute" | "second";
type TimeInputStyle = "scroll" | "input";
type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
type Period = "AM" | "PM";

// ============================================================
// time utils (restored from the typeable-input version;
// shared by both the "input" and "scroll" time styles)
// ============================================================

function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = { min: number; max: number; step: number };

function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig
) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return "00";
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) return hour + 12;
    return hour;
  }
  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return "00";
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case "minutes":
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

// ============================================================
// calendar utils
// ============================================================

function genMonths(
  locale: Pick<Locale, "options" | "localize" | "formatLong">
) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), "MMMM", { locale }),
  }));
}

function genYears(yearRange = 50) {
  const today = new Date();
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString(),
  }));
}

// ============================================================
// Calendar (unchanged across both prior versions)
// ============================================================

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange = 50,
  ...props
}: DayPickerProps & { yearRange?: number }) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, "options" | "localize" | "formatLong"> = enUS;
    const { options, localize, formatLong } = props.locale || {};
    if (options && localize && formatLong) {
      locale = { options, localize, formatLong };
    }
    return genMonths(locale);
  }, []);

  const YEARS = React.useMemo(() => genYears(yearRange), []);

  const disableLeftNavigation = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear() - yearRange, 0, 1);
    if (props.month) {
      return (
        props.month.getMonth() === startDate.getMonth() &&
        props.month.getFullYear() === startDate.getFullYear()
      );
    }
    return false;
  };

  const disableRightNavigation = () => {
    const today = new Date();
    const endDate = new Date(today.getFullYear() + yearRange, 11, 31);
    if (props.month) {
      return (
        props.month.getMonth() === endDate.getMonth() &&
        props.month.getFullYear() === endDate.getFullYear()
      );
    }
    return false;
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-center",
        month: "flex flex-col items-center space-y-4",
        month_caption:
          "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-5 top-5",
          disableLeftNavigation() && "pointer-events-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-5 top-5",
          disableRightNavigation() && "pointer-events-none"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: cn("flex", props.showWeekNumber && "justify-end"),
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-l-md rounded-r-md"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) =>
          props.orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
        MonthCaption: ({ calendarMonth }) => {
          return (
            <div className="inline-flex gap-2">
              <Select
                defaultValue={calendarMonth.date.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setMonth(Number.parseInt(value, 10));
                  props.onMonthChange?.(newDate);
                }}
              >
                <SelectTrigger className="focus:bg-accent focus:text-accent-foreground w-fit gap-1 border-none p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                defaultValue={calendarMonth.date.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(calendarMonth.date);
                  newDate.setFullYear(Number.parseInt(value, 10));
                  props.onMonthChange?.(newDate);
                }}
              >
                <SelectTrigger className="focus:bg-accent focus:text-accent-foreground w-fit gap-1 border-none p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value.toString()}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

// ============================================================
// "input" time style — typeable fields (restored)
// ============================================================

interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);
      // trigger an update whenever the user switches between AM and PM;
      // otherwise the user would have to manually change the hour each time
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(
          setDateByType(
            tempDate,
            hours.toString(),
            "12hours",
            period === "AM" ? "PM" : "AM"
          )
        );
      }
    };

    return (
      <div className="flex h-10 items-center">
        <Select
          defaultValue={period}
          onValueChange={(value: Period) => handleValueChange(value)}
        >
          <SelectTrigger
            ref={ref}
            className="focus:bg-accent focus:text-accent-foreground w-[65px]"
            onKeyDown={handleKeyDown}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
);
TimePeriodSelect.displayName = "TimePeriodSelect";

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "tel",
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

    // allow the user to enter the second digit within 2 seconds
    // otherwise start again with entering the first digit
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => setFlag(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date, picker]);

    const calculateNewValue = (key: string) => {
      if (picker === "12hours") {
        if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0")
          return `0${key}`;
      }
      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= "0" && e.key <= "9") {
        if (picker === "12hours") setPrevIntKey(e.key);
        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          "focus:bg-accent focus:text-accent-foreground w-[48px] text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault();
          onChange?.(e);
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        {...props}
      />
    );
  }
);
TimePickerInput.displayName = "TimePickerInput";

interface InputTimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  granularity?: Granularity;
  timeOnly?: boolean;
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
}

const InputTimePicker = React.forwardRef<TimePickerRef, InputTimePickerProps>(
  ({ date, onChange, hourCycle = 24, granularity = "second", timeOnly }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = React.useState<Period>(
      date && date.getHours() >= 12 ? "PM" : "AM"
    );

    useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
      }),
      [minuteRef, hourRef, secondRef]
    );

    return (
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="datetime-picker-hour-input" className="cursor-pointer">
          {!timeOnly && <Clock className="mr-2 h-4 w-4" />}
        </label>
        <TimePickerInput
          picker={hourCycle === 24 ? "hours" : "12hours"}
          date={date}
          id="datetime-picker-hour-input"
          onDateChange={onChange}
          ref={hourRef}
          period={period}
          onRightFocus={() => minuteRef?.current?.focus()}
        />
        {(granularity === "minute" || granularity === "second") && (
          <>
            :
            <TimePickerInput
              picker="minutes"
              date={date}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {granularity === "second" && (
          <>
            :
            <TimePickerInput
              picker="seconds"
              date={date}
              onDateChange={onChange}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className="grid gap-1 text-center">
            <TimePeriodSelect
              period={period}
              setPeriod={setPeriod}
              date={date}
              onDateChange={(date) => {
                onChange?.(date);
                if (date && date.getHours() >= 12) setPeriod("PM");
                else setPeriod("AM");
              }}
              ref={periodRef}
              onLeftFocus={() => secondRef?.current?.focus()}
            />
          </div>
        )}
      </div>
    );
  }
);
InputTimePicker.displayName = "InputTimePicker";

// kept as `TimePicker` for backwards-compatible exports
const TimePicker = InputTimePicker;

// ============================================================
// "scroll" time style — tap columns, now granularity- and
// hourCycle-aware (previously always showed hour+minute only,
// with no seconds and no working 12-hour support)
// ============================================================

interface ScrollTimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  granularity?: Granularity;
  step?: number;
}

function ScrollTimePicker({
  date,
  onChange,
  hourCycle = 24,
  granularity = "minute",
  step = 5,
}: ScrollTimePickerProps) {
  const [period, setPeriod] = React.useState<Period>(
    date && date.getHours() >= 12 ? "PM" : "AM"
  );

  const hours =
    hourCycle === 24
      ? Array.from({ length: 24 }, (_, i) => i)
      : Array.from({ length: 12 }, (_, i) => i + 1);

  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);
  const seconds = minutes;

  const selectedHour =
    hourCycle === 24
      ? date?.getHours()
      : date
      ? parseInt(getDateByType(date, "12hours"), 10)
      : undefined;

  const handleHourClick = (hour: number) => {
    const base = date ? new Date(date) : new Date();
    if (hourCycle === 24) {
      onChange?.(setDateByType(base, hour.toString(), "hours"));
    } else {
      onChange?.(setDateByType(base, hour.toString(), "12hours", period));
    }
  };

  const handlePeriodClick = (newPeriod: Period) => {
    setPeriod(newPeriod);
    if (!date) return;
    const base = new Date(date);
    const hours = display12HourValue(date.getHours());
    onChange?.(setDateByType(base, hours, "12hours", newPeriod));
  };

  const handleMinuteClick = (minute: number) => {
    const base = date ? new Date(date) : new Date();
    onChange?.(setDateByType(base, minute.toString(), "minutes"));
  };

  const handleSecondClick = (second: number) => {
    const base = date ? new Date(date) : new Date();
    onChange?.(setDateByType(base, second.toString(), "seconds"));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x border-t sm:border-t-0 sm:border-l">
      {/* Hours */}
      <ScrollArea className="w-full sm:w-auto">
        <div className="flex sm:flex-col p-2">
          {hours.map((hour) => (
            <Button
              key={hour}
              size="icon"
              variant={selectedHour === hour ? "default" : "ghost"}
              className="sm:w-full shrink-0 aspect-square"
              onClick={() => handleHourClick(hour)}
            >
              {hour.toString().padStart(2, "0")}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="sm:hidden" />
      </ScrollArea>

      {/* Minutes */}
      {(granularity === "minute" || granularity === "second") && (
        <ScrollArea className="w-full sm:w-auto">
          <div className="flex sm:flex-col p-2">
            {minutes.map((minute) => (
              <Button
                key={minute}
                size="icon"
                variant={
                  date && date.getMinutes() === minute ? "default" : "ghost"
                }
                className="sm:w-full shrink-0 aspect-square"
                onClick={() => handleMinuteClick(minute)}
              >
                {minute.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      )}

      {/* Seconds */}
      {granularity === "second" && (
        <ScrollArea className="w-full sm:w-auto">
          <div className="flex sm:flex-col p-2">
            {seconds.map((second) => (
              <Button
                key={second}
                size="icon"
                variant={
                  date && date.getSeconds() === second ? "default" : "ghost"
                }
                className="sm:w-full shrink-0 aspect-square"
                onClick={() => handleSecondClick(second)}
              >
                {second.toString().padStart(2, "0")}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="sm:hidden" />
        </ScrollArea>
      )}

      {/* AM / PM */}
      {hourCycle === 12 && (
        <div className="flex sm:flex-col gap-1 p-2 justify-center">
          {(["AM", "PM"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "ghost"}
              onClick={() => handlePeriodClick(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
ScrollTimePicker.displayName = "ScrollTimePicker";

// ============================================================
// DateTimePicker — unified
// ============================================================

type DateTimePickerProps = {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onMonthChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  hourCycle?: 12 | 24;
  placeholder?: string;
  yearRange?: number;
  displayFormat?: { hour24?: string; hour12?: string };
  granularity?: Granularity;
  className?: string;
  defaultPopupValue?: Date;
  minDate?: Date;
  maxDate?: Date;
  /** Hide the calendar and show only the time UI. */
  timeOnly?: boolean;
  /** Which time-selection UI to render. Default: "scroll". */
  timeInputStyle?: TimeInputStyle;
  /** Minute/second increment for the "scroll" style. Default: 5. */
  scrollStep?: number;
  /**
   * Close the popover as soon as a calendar day is selected.
   * Defaults to `true` for both styles. Set to `false` if you
   * want the popover to stay open after a date click so the
   * user can still adjust the time (mainly useful for "input"
   * style, where time entry happens after the date click).
   */
  closeOnSelect?: boolean;
} & Pick<
  DayPickerProps,
  "locale" | "weekStartsOn" | "showWeekNumber" | "showOutsideDays"
>;

type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLButtonElement, "value">;

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = enUS,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      onMonthChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = "minute",
      timeOnly = false,
      timeInputStyle = "scroll",
      scrollStep = 5,
      closeOnSelect,
      placeholder,
      minDate,
      maxDate,
      className,
      ...props
    },
    ref
  ) => {
    const resolvedPlaceholder =
      placeholder ?? (timeOnly ? "Pick a time" : "Pick a date");
    const resolvedCloseOnSelect = closeOnSelect ?? true;

    const [open, setOpen] = React.useState(false);
    const [month, setMonth] = React.useState<Date>(value ?? defaultPopupValue);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [displayDate, setDisplayDate] = React.useState<Date | undefined>(
      value ?? undefined
    );
    onMonthChange ||= onChange;

    React.useEffect(() => {
      setDisplayDate(value);
    }, [value]);

    // carry over the current time when a user clicks a new day
    // instead of resetting to 00:00
    const handleMonthChange = (newDay: Date | undefined) => {
      if (!newDay) return;
      if (!defaultPopupValue) {
        newDay.setHours(
          month?.getHours() ?? 0,
          month?.getMinutes() ?? 0,
          month?.getSeconds() ?? 0
        );
        onMonthChange?.(newDay);
        setMonth(newDay);
        return;
      }
      const diff = newDay.getTime() - defaultPopupValue.getTime();
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      const newDateFull = add(defaultPopupValue, {
        days: Math.ceil(diffInDays),
      });
      newDateFull.setHours(
        month?.getHours() ?? 0,
        month?.getMinutes() ?? 0,
        month?.getSeconds() ?? 0
      );
      onMonthChange?.(newDateFull);
      setMonth(newDateFull);
    };

    const onSelect = (newDay?: Date) => {
      if (!newDay) return;
      onChange?.(newDay);
      setMonth(newDay);
      setDisplayDate(newDay);
      if (resolvedCloseOnSelect) setOpen(false);
    };

    const handleTimeChange = (newDate: Date | undefined) => {
      if (!newDate) return;
      onChange?.(newDate);
      setMonth(newDate);
      setDisplayDate(newDate);
    };

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value: displayDate,
      }),
      [displayDate]
    );

    const initHourFormat = {
      hour24:
        displayFormat?.hour24 ??
        `PPP HH:mm${granularity === "second" ? ":ss" : ""}`,
      hour12:
        displayFormat?.hour12 ??
        `PP hh:mm${granularity === "second" ? ":ss" : ""} b`,
    };

    let loc = enUS;
    const { options, localize, formatLong } = locale;
    if (options && localize && formatLong) {
      loc = { ...enUS, options, localize, formatLong };
    }

    const showTimeUI = granularity !== "day";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayDate && "text-muted-foreground",
              className
            )}
            ref={buttonRef}
          >
            {timeOnly ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CalendarIcon className="h-4 w-4" />
            )}
            {displayDate ? (
              format(
                displayDate,
                timeOnly
                  ? hourCycle === 24
                    ? "HH:mm"
                    : "hh:mm a"
                  : hourCycle === 24
                  ? initHourFormat.hour24
                  : initHourFormat.hour12,
                { locale: loc }
              )
            ) : (
              <span>{resolvedPlaceholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div
            className={cn(
              timeInputStyle === "scroll" ? "sm:flex" : "flex flex-col"
            )}
          >
            {!timeOnly && (
              <div className="shrink-0">
                <div className="relative">
                  <Calendar
                    {...props}
                    mode="single"
                    selected={displayDate}
                    month={month}
                    onSelect={() => {}}
                    onDayClick={(newDate) => {
                      if (newDate) {
                        newDate.setHours(
                          month?.getHours() ?? 0,
                          month?.getMinutes() ?? 0,
                          month?.getSeconds() ?? 0
                        );
                        onSelect(newDate);
                      }
                    }}
                    onMonthChange={handleMonthChange}
                    yearRange={yearRange}
                    locale={locale}
                    disabled={(date) => {
                      if (minDate && date < minDate) return true;
                      if (maxDate && date > maxDate) return true;
                      return false;
                    }}
                  />
                </div>
              </div>
            )}

            {showTimeUI &&
              (timeInputStyle === "scroll" ? (
                <ScrollTimePicker
                  date={month}
                  onChange={handleTimeChange}
                  hourCycle={hourCycle}
                  granularity={granularity}
                  step={scrollStep}
                />
              ) : (
                <div className="border-border border-t p-3">
                  <InputTimePicker
                    timeOnly={timeOnly}
                    date={month}
                    onChange={handleTimeChange}
                    hourCycle={hourCycle}
                    granularity={granularity}
                  />
                </div>
              ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, TimePicker, TimePickerInput };
export type {
  TimePickerType,
  TimeInputStyle,
  DateTimePickerProps,
  DateTimePickerRef,
};