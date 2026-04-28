"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_ISO,
  findCountryByIso,
  splitStoredPhone,
} from "@/lib/countryCodes";

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
};

const composePhone = (dialCode: string, nationalNumber: string) => {
  const digitsOnly = nationalNumber.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return `${dialCode} ${digitsOnly}`;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    { id, value, onChange, onBlur, placeholder, invalid },
    ref,
  ) {
    const initial = useMemo(() => splitStoredPhone(value), []); // eslint-disable-line react-hooks/exhaustive-deps
    const [iso, setIso] = useState<string>(initial.iso || DEFAULT_COUNTRY_ISO);
    const [nationalNumber, setNationalNumber] = useState<string>(
      initial.nationalNumber,
    );

    const country = findCountryByIso(iso) ?? findCountryByIso(DEFAULT_COUNTRY_ISO)!;

    useEffect(() => {
      const nextSplit = splitStoredPhone(value);
      if (
        nextSplit.iso !== iso ||
        nextSplit.nationalNumber !== nationalNumber
      ) {
        if (nextSplit.nationalNumber !== nationalNumber) {
          setNationalNumber(nextSplit.nationalNumber);
        }
        if (nextSplit.iso !== iso && value) {
          setIso(nextSplit.iso);
        }
      }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCountryChange = (nextIso: string) => {
      setIso(nextIso);
      const nextCountry = findCountryByIso(nextIso);
      if (!nextCountry) return;
      onChange(composePhone(nextCountry.dialCode, nationalNumber));
    };

    const handleNumberChange = (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, 15);
      setNationalNumber(digits);
      onChange(composePhone(country.dialCode, digits));
    };

    return (
      <div className="flex items-stretch gap-2">
        <Select value={iso} onValueChange={(next) => handleCountryChange(next as string)}>
          <SelectTrigger
            aria-label="Country code"
            className="w-[112px] shrink-0"
            aria-invalid={invalid}
          >
            <SelectValue placeholder="Code">
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{country.flag}</span>
                <span className="text-[15px] font-normal tracking-[-0.02em]">
                  {country.dialCode}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            align="start"
            sideOffset={6}
            alignItemWithTrigger={false}
            className="max-h-72 w-[280px] p-1"
          >
            {COUNTRY_CODES.map((entry) => (
              <SelectItem key={entry.iso} value={entry.iso}>
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-base leading-none">{entry.flag}</span>
                    <span className="truncate text-sm">{entry.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.dialCode}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          ref={ref}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder ?? "9876543210"}
          value={nationalNumber}
          onChange={(event) => handleNumberChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid}
          maxLength={15}
        />
      </div>
    );
  },
);
