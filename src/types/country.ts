export interface CountryApiResponse {
  error: boolean;
  data: CountryApiItem[];
}

export interface CountryApiItem {
  name: string;
  code: string;
  dial_code: string;
}

export interface CountryCallingCode {
  isoCode: string;
  name: string;
  flag: string;
  callingCode: string;
}

export interface PhoneNumberFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
