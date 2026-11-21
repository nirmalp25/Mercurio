import countriesJson from './countries.json';
import enquiryFormJson from './forms/enquiry.json';
import loginFormJson from './forms/login.json';
import homeJson from './ui/home.json';
import searchJson from './ui/search.json';
import type { Country, FormConfig, HomeConfig, SearchConfig } from './schema';

// Typed access to JSON configs. Swapping a JSON file (or loading it from the API later)
// only changes this module.
export const countries = countriesJson as Country[];
export const enquiryForm = enquiryFormJson as FormConfig;
export const loginForm = loginFormJson as FormConfig;
export const homeConfig = homeJson as HomeConfig;
export const searchConfig = searchJson as SearchConfig;
