"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_COUNTRY_ISO,
  FALLBACK_COUNTRY_CALLING_CODES,
} from "@/constants/countries";
import { useCountryCallingCodes } from "@/hooks/useCountryCallingCodes";
import type { PhoneNumberFieldProps } from "@/types/country";

export function PhoneNumberField({
  value,
  onChange,
  disabled,
}: PhoneNumberFieldProps) {
  const { data, isLoading } = useCountryCallingCodes();
  const countries = data?.length ? data : FALLBACK_COUNTRY_CALLING_CODES;
  const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
  const [nationalNumber, setNationalNumber] = useState("");

  const selectedCountry = useMemo(
    () => countries.find((country) => country.isoCode === countryIso) ?? countries[0],
    [countries, countryIso]
  );

  useEffect(() => {
    const normalized = value.replace(/[^\d+]/g, "");
    const matchedCountry = [...countries]
      .sort((first, second) => second.callingCode.length - first.callingCode.length)
      .find((country) => normalized.startsWith(country.callingCode));

    if (matchedCountry) {
      setCountryIso(matchedCountry.isoCode);
      setNationalNumber(normalized.slice(matchedCountry.callingCode.length));
    } else {
      const digits = normalized.replace(/\D/g, "");
      setNationalNumber(digits);
      if (digits && !normalized.startsWith("+")) {
        onChange(`${selectedCountry.callingCode}${digits}`);
      }
    }
  }, [countries, onChange, selectedCountry.callingCode, value]);

  const handleCountryChange = (isoCode: string | null) => {
    if (!isoCode) return;
    const country = countries.find((item) => item.isoCode === isoCode);
    if (!country) return;
    setCountryIso(isoCode);
    onChange(nationalNumber ? `${country.callingCode}${nationalNumber}` : "");
  };

  const handleNumberChange = (input: string) => {
    const digits = input.replace(/\D/g, "");
    setNationalNumber(digits);
    onChange(digits ? `${selectedCountry.callingCode}${digits}` : "");
  };

  return (
    <div className="flex gap-2">
      <Select
        value={countryIso}
        onValueChange={handleCountryChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="h-9 w-36 shrink-0" aria-label="Country calling code">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.isoCode} value={country.isoCode}>
              {country.flag} {country.callingCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={nationalNumber}
        onChange={(event) => handleNumberChange(event.target.value)}
        placeholder="Phone number"
        disabled={disabled}
      />
    </div>
  );
}
