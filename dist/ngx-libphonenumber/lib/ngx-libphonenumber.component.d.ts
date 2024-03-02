import { ElementRef, EventEmitter, SimpleChanges } from '@angular/core';
import { CountryCode } from './data/country-code';
import { CountryISO } from './enums/country-iso.enum';
import { SearchCountryField } from './enums/search-country-field.enum';
import { ChangeData } from './interfaces/change-data';
import { Country } from './model/country.model';
import { PhoneNumberFormat } from './enums/phone-number-format.enum';
import * as i0 from "@angular/core";
export declare class NgxLibphonenumberComponent {
    private countryCodeData;
    value: string | undefined;
    preferredCountries: Array<string>;
    enablePlaceholder: boolean;
    customPlaceholder: string;
    numberFormat: PhoneNumberFormat;
    cssClass: string;
    onlyCountries: Array<string>;
    enableAutoCountrySelect: boolean;
    searchCountryFlag: boolean;
    searchCountryField: SearchCountryField[];
    searchCountryPlaceholder: string;
    maxLength: number;
    selectFirstCountry: boolean;
    selectedCountryISO: CountryISO;
    phoneValidation: boolean;
    inputId: string;
    separateDialCode: boolean;
    separateDialCodeClass: string;
    readonly countryChange: EventEmitter<Country>;
    selectedCountry: Country;
    phoneNumber: string | undefined;
    allCountries: Array<Country>;
    preferredCountriesInDropDown: Array<Country>;
    phoneUtil: any;
    disabled: boolean;
    errors: Array<any>;
    countrySearchText: string;
    countryList: ElementRef;
    onTouched: () => void;
    propagateChange: (_: ChangeData) => void;
    constructor(countryCodeData: CountryCode);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    init(): void;
    setSelectedCountry(country: Country): void;
    /**
     * Search country based on country name, iso2, dialCode or all of them.
     */
    searchCountry(): void;
    onPhoneNumberChange(): void;
    onCountrySelect(country: Country, el: {
        focus: () => void;
    }): void;
    onInputKeyPress(event: KeyboardEvent): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    writeValue(obj: any): void;
    resolvePlaceholder(): string;
    /**
     * Returns parse PhoneNumber object.
     * @param phoneNumber string
     * @param countryCode string
     */
    private getParsedNumber;
    /**
     * Adjusts input alignment based on the dial code presentation style.
     */
    private checkSeparateDialCodeStyle;
    /**
     * Cleans dialcode from phone number string.
     * @param phoneNumber string
     */
    private removeDialCode;
    /**
     * Sifts through all countries and returns iso code of the primary country
     * based on the number provided.
     * @param countryCode country code in number format
     * @param number PhoneNumber object
     */
    private getCountryIsoCode;
    /**
     * Gets formatted example phone number from phoneUtil.
     * @param countryCode string
     */
    protected getPhoneNumberPlaceHolder(countryCode: string): string;
    /**
     * Clearing the list to avoid duplicates (https://github.com/webcat12345/ngx-intl-tel-input/issues/248)
     */
    protected fetchCountryData(): void;
    /**
     * Populates preferredCountriesInDropDown with prefferred countries.
     */
    private updatePreferredCountries;
    /**
     * Updates selectedCountry.
     */
    private updateSelectedCountry;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxLibphonenumberComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxLibphonenumberComponent, "lib-ngx-libphonenumber", never, { "value": "value"; "preferredCountries": "preferredCountries"; "enablePlaceholder": "enablePlaceholder"; "customPlaceholder": "customPlaceholder"; "numberFormat": "numberFormat"; "cssClass": "cssClass"; "onlyCountries": "onlyCountries"; "enableAutoCountrySelect": "enableAutoCountrySelect"; "searchCountryFlag": "searchCountryFlag"; "searchCountryField": "searchCountryField"; "searchCountryPlaceholder": "searchCountryPlaceholder"; "maxLength": "maxLength"; "selectFirstCountry": "selectFirstCountry"; "selectedCountryISO": "selectedCountryISO"; "phoneValidation": "phoneValidation"; "inputId": "inputId"; "separateDialCode": "separateDialCode"; }, { "countryChange": "countryChange"; }, never, never, false, never>;
}
