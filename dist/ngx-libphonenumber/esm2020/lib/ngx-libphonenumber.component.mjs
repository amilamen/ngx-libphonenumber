import * as lpn from 'google-libphonenumber';
import { Component, EventEmitter, forwardRef, Input, Output, ViewChild, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { setTheme } from 'ngx-bootstrap/utils';
import { CountryCode } from './data/country-code';
import { SearchCountryField } from './enums/search-country-field.enum';
import { phoneNumberValidator } from './ngx-libphonenumber.validator';
import { PhoneNumberFormat } from './enums/phone-number-format.enum';
import * as i0 from "@angular/core";
import * as i1 from "./data/country-code";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
import * as i4 from "ngx-bootstrap/dropdown";
import * as i5 from "./directives/native-element-injector.directive";
export class NgxLibphonenumberComponent {
    constructor(countryCodeData) {
        this.countryCodeData = countryCodeData;
        this.value = '';
        this.preferredCountries = [];
        this.enablePlaceholder = true;
        this.numberFormat = PhoneNumberFormat.International;
        this.cssClass = 'form-control';
        this.onlyCountries = [];
        this.enableAutoCountrySelect = true;
        this.searchCountryFlag = false;
        this.searchCountryField = [SearchCountryField.All];
        this.searchCountryPlaceholder = 'Search Country';
        this.selectFirstCountry = true;
        this.phoneValidation = true;
        this.inputId = 'phone';
        this.separateDialCode = false;
        this.countryChange = new EventEmitter();
        this.selectedCountry = {
            areaCodes: undefined,
            dialCode: '',
            htmlId: '',
            flagClass: '',
            iso2: '',
            name: '',
            placeHolder: '',
            priority: 0,
        };
        this.phoneNumber = '';
        this.allCountries = [];
        this.preferredCountriesInDropDown = [];
        // Has to be 'any' to prevent a need to install @types/google-libphonenumber by the package user...
        this.phoneUtil = lpn.PhoneNumberUtil.getInstance();
        this.disabled = false;
        this.errors = ['Phone number is required.'];
        this.countrySearchText = '';
        this.onTouched = () => { };
        this.propagateChange = (_) => { };
        // If this is not set, ngx-bootstrap will try to use the bs3 CSS (which is not what we've embedded) and will
        // Add the wrong classes and such
        setTheme('bs4');
    }
    ngOnInit() {
        this.init();
    }
    ngOnChanges(changes) {
        const selectedISO = changes['selectedCountryISO'];
        if (this.allCountries &&
            selectedISO &&
            selectedISO.currentValue !== selectedISO.previousValue) {
            this.updateSelectedCountry();
        }
        if (changes['preferredCountries']) {
            this.updatePreferredCountries();
        }
        this.checkSeparateDialCodeStyle();
    }
    /*
          This is a wrapper method to avoid calling this.ngOnInit() in writeValue().
          Ref: http://codelyzer.com/rules/no-life-cycle-call/
      */
    init() {
        this.fetchCountryData();
        if (this.preferredCountries.length) {
            this.updatePreferredCountries();
        }
        if (this.onlyCountries.length) {
            this.allCountries = this.allCountries.filter((c) => this.onlyCountries.includes(c.iso2));
        }
        if (this.selectFirstCountry) {
            if (this.preferredCountriesInDropDown.length) {
                this.setSelectedCountry(this.preferredCountriesInDropDown[0]);
            }
            else {
                this.setSelectedCountry(this.allCountries[0]);
            }
        }
        this.updateSelectedCountry();
        this.checkSeparateDialCodeStyle();
    }
    setSelectedCountry(country) {
        this.selectedCountry = country;
        this.countryChange.emit(country);
    }
    /**
     * Search country based on country name, iso2, dialCode or all of them.
     */
    searchCountry() {
        if (!this.countrySearchText) {
            this.countryList.nativeElement
                .querySelector('.iti__country-list li')
                .scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }
        const countrySearchTextLower = this.countrySearchText.toLowerCase();
        // @ts-ignore
        const country = this.allCountries.filter((c) => {
            if (this.searchCountryField.indexOf(SearchCountryField.All) > -1) {
                // Search in all fields
                if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
                    return c;
                }
                if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
                    return c;
                }
                if (c.dialCode.startsWith(this.countrySearchText)) {
                    return c;
                }
            }
            else {
                // Or search by specific SearchCountryField(s)
                if (this.searchCountryField.indexOf(SearchCountryField.Iso2) > -1) {
                    if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
                        return c;
                    }
                }
                if (this.searchCountryField.indexOf(SearchCountryField.Name) > -1) {
                    if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
                        return c;
                    }
                }
                if (this.searchCountryField.indexOf(SearchCountryField.DialCode) > -1) {
                    if (c.dialCode.startsWith(this.countrySearchText)) {
                        return c;
                    }
                }
            }
        });
        if (country.length > 0) {
            const el = this.countryList.nativeElement.querySelector('#' + country[0].htmlId);
            if (el) {
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                });
            }
        }
        this.checkSeparateDialCodeStyle();
    }
    onPhoneNumberChange() {
        let countryCode;
        // Handle the case where the user sets the value programatically based on a persisted ChangeData obj.
        if (this.phoneNumber && typeof this.phoneNumber === 'object') {
            const numberObj = this.phoneNumber;
            this.phoneNumber = numberObj.number;
            countryCode = numberObj.countryCode;
        }
        this.value = this.phoneNumber;
        countryCode = countryCode || this.selectedCountry.iso2;
        // @ts-ignore
        const number = this.getParsedNumber(this.phoneNumber, countryCode);
        // auto select country based on the extension (and areaCode if needed) (e.g select Canada if number starts with +1 416)
        if (this.enableAutoCountrySelect) {
            countryCode =
                number && number.getCountryCode()
                    ? // @ts-ignore
                        this.getCountryIsoCode(number.getCountryCode(), number)
                    : this.selectedCountry.iso2;
            if (countryCode && countryCode !== this.selectedCountry.iso2) {
                const newCountry = this.allCountries
                    .sort((a, b) => {
                    return a.priority - b.priority;
                })
                    .find((c) => c.iso2 === countryCode);
                if (newCountry) {
                    this.selectedCountry = newCountry;
                }
            }
        }
        countryCode = countryCode ? countryCode : this.selectedCountry.iso2;
        this.checkSeparateDialCodeStyle();
        if (!this.value) {
            // Reason: avoid https://stackoverflow.com/a/54358133/1617590
            // tslint:disable-next-line: no-null-keyword
            // @ts-ignore
            this.propagateChange(null);
        }
        else {
            const intlNo = number
                ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL)
                : '';
            // parse phoneNumber if separate dial code is needed
            if (this.separateDialCode && intlNo) {
                this.value = this.removeDialCode(intlNo);
            }
            this.propagateChange({
                number: this.value,
                internationalNumber: intlNo,
                nationalNumber: number
                    ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL)
                    : '',
                e164Number: number
                    ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.E164)
                    : '',
                countryCode: countryCode.toUpperCase(),
                dialCode: '+' + this.selectedCountry.dialCode,
            });
        }
    }
    onCountrySelect(country, el) {
        this.setSelectedCountry(country);
        this.checkSeparateDialCodeStyle();
        if (this.phoneNumber && this.phoneNumber.length > 0) {
            this.value = this.phoneNumber;
            const number = this.getParsedNumber(this.phoneNumber, this.selectedCountry.iso2);
            const intlNo = number
                ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL)
                : '';
            // parse phoneNumber if separate dial code is needed
            if (this.separateDialCode && intlNo) {
                this.value = this.removeDialCode(intlNo);
            }
            this.propagateChange({
                number: this.value,
                internationalNumber: intlNo,
                nationalNumber: number
                    ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL)
                    : '',
                e164Number: number
                    ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.E164)
                    : '',
                countryCode: this.selectedCountry.iso2.toUpperCase(),
                dialCode: '+' + this.selectedCountry.dialCode,
            });
        }
        else {
            // Reason: avoid https://stackoverflow.com/a/54358133/1617590
            // tslint:disable-next-line: no-null-keyword
            // @ts-ignore
            this.propagateChange(null);
        }
        el.focus();
    }
    onInputKeyPress(event) {
        const allowedChars = /[0-9\+\-\(\)\ ]/;
        const allowedCtrlChars = /[axcv]/; // Allows copy-pasting
        const allowedOtherKeys = [
            'ArrowLeft',
            'ArrowUp',
            'ArrowRight',
            'ArrowDown',
            'Home',
            'End',
            'Insert',
            'Delete',
            'Backspace',
        ];
        if (!allowedChars.test(event.key) &&
            !(event.ctrlKey && allowedCtrlChars.test(event.key)) &&
            !allowedOtherKeys.includes(event.key)) {
            event.preventDefault();
        }
    }
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    writeValue(obj) {
        if (obj === undefined) {
            this.init();
        }
        this.phoneNumber = obj;
        setTimeout(() => {
            this.onPhoneNumberChange();
        }, 1);
    }
    resolvePlaceholder() {
        let placeholder = '';
        if (this.customPlaceholder) {
            placeholder = this.customPlaceholder;
        }
        else if (this.selectedCountry.placeHolder) {
            placeholder = this.selectedCountry.placeHolder;
            if (this.separateDialCode) {
                placeholder = this.removeDialCode(placeholder);
            }
        }
        return placeholder;
    }
    /* --------------------------------- Helpers -------------------------------- */
    /**
     * Returns parse PhoneNumber object.
     * @param phoneNumber string
     * @param countryCode string
     */
    getParsedNumber(phoneNumber, countryCode) {
        let number;
        try {
            number = this.phoneUtil.parse(phoneNumber, countryCode.toUpperCase());
        }
        catch (e) { }
        // @ts-ignore
        return number;
    }
    /**
     * Adjusts input alignment based on the dial code presentation style.
     */
    checkSeparateDialCodeStyle() {
        if (this.separateDialCode && this.selectedCountry) {
            const cntryCd = this.selectedCountry.dialCode;
            this.separateDialCodeClass =
                'separate-dial-code iti-sdc-' + (cntryCd.length + 1);
        }
        else {
            this.separateDialCodeClass = '';
        }
    }
    /**
     * Cleans dialcode from phone number string.
     * @param phoneNumber string
     */
    removeDialCode(phoneNumber) {
        const number = this.getParsedNumber(phoneNumber, this.selectedCountry.iso2);
        phoneNumber = this.phoneUtil.format(number, lpn.PhoneNumberFormat[this.numberFormat]);
        if (phoneNumber.startsWith('+') && this.separateDialCode) {
            phoneNumber = phoneNumber.substr(phoneNumber.indexOf(' ') + 1);
        }
        return phoneNumber;
    }
    /**
     * Sifts through all countries and returns iso code of the primary country
     * based on the number provided.
     * @param countryCode country code in number format
     * @param number PhoneNumber object
     */
    getCountryIsoCode(countryCode, number) {
        // Will use this to match area code from the first numbers
        // @ts-ignore
        const rawNumber = number['values_']['2'].toString();
        // List of all countries with countryCode (can be more than one. e.x. US, CA, DO, PR all have +1 countryCode)
        const countries = this.allCountries.filter((c) => c.dialCode === countryCode.toString());
        // Main country is the country, which has no areaCodes specified in country-code.ts file.
        const mainCountry = countries.find((c) => c.areaCodes === undefined);
        // Secondary countries are all countries, which have areaCodes specified in country-code.ts file.
        const secondaryCountries = countries.filter((c) => c.areaCodes !== undefined);
        let matchedCountry = mainCountry ? mainCountry.iso2 : undefined;
        /*
                Iterate over each secondary country and check if nationalNumber starts with any of areaCodes available.
                If no matches found, fallback to the main country.
            */
        secondaryCountries.forEach((country) => {
            // @ts-ignore
            country.areaCodes.forEach((areaCode) => {
                if (rawNumber.startsWith(areaCode)) {
                    matchedCountry = country.iso2;
                }
            });
        });
        return matchedCountry;
    }
    /**
     * Gets formatted example phone number from phoneUtil.
     * @param countryCode string
     */
    getPhoneNumberPlaceHolder(countryCode) {
        try {
            return this.phoneUtil.format(this.phoneUtil.getExampleNumber(countryCode), lpn.PhoneNumberFormat[this.numberFormat]);
        }
        catch (e) {
            // @ts-ignore
            return e;
        }
    }
    /**
     * Clearing the list to avoid duplicates (https://github.com/webcat12345/ngx-intl-tel-input/issues/248)
     */
    fetchCountryData() {
        this.allCountries = [];
        this.countryCodeData.allCountries.forEach((c) => {
            const country = {
                name: c[0].toString(),
                iso2: c[1].toString(),
                dialCode: c[2].toString(),
                priority: +c[3] || 0,
                areaCodes: c[4] || undefined,
                htmlId: `iti-0__item-${c[1].toString()}`,
                flagClass: `iti__${c[1].toString().toLocaleLowerCase()}`,
                placeHolder: '',
            };
            if (this.enablePlaceholder) {
                country.placeHolder = this.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
            }
            this.allCountries.push(country);
        });
    }
    /**
     * Populates preferredCountriesInDropDown with prefferred countries.
     */
    updatePreferredCountries() {
        if (this.preferredCountries.length) {
            this.preferredCountriesInDropDown = [];
            this.preferredCountries.forEach((iso2) => {
                const preferredCountry = this.allCountries.filter((c) => {
                    return c.iso2 === iso2;
                });
                this.preferredCountriesInDropDown.push(preferredCountry[0]);
            });
        }
    }
    /**
     * Updates selectedCountry.
     */
    updateSelectedCountry() {
        if (this.selectedCountryISO) {
            // @ts-ignore
            this.selectedCountry = this.allCountries.find((c) => {
                return c.iso2.toLowerCase() === this.selectedCountryISO.toLowerCase();
            });
            if (this.selectedCountry) {
                if (this.phoneNumber) {
                    this.onPhoneNumberChange();
                }
                else {
                    // Reason: avoid https://stackoverflow.com/a/54358133/1617590
                    // tslint:disable-next-line: no-null-keyword
                    // @ts-ignore
                    this.propagateChange(null);
                }
            }
        }
    }
}
NgxLibphonenumberComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberComponent, deps: [{ token: i1.CountryCode }], target: i0.ɵɵFactoryTarget.Component });
NgxLibphonenumberComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: NgxLibphonenumberComponent, selector: "lib-ngx-libphonenumber", inputs: { value: "value", preferredCountries: "preferredCountries", enablePlaceholder: "enablePlaceholder", customPlaceholder: "customPlaceholder", numberFormat: "numberFormat", cssClass: "cssClass", onlyCountries: "onlyCountries", enableAutoCountrySelect: "enableAutoCountrySelect", searchCountryFlag: "searchCountryFlag", searchCountryField: "searchCountryField", searchCountryPlaceholder: "searchCountryPlaceholder", maxLength: "maxLength", selectFirstCountry: "selectFirstCountry", selectedCountryISO: "selectedCountryISO", phoneValidation: "phoneValidation", inputId: "inputId", separateDialCode: "separateDialCode" }, outputs: { countryChange: "countryChange" }, providers: [
        CountryCode,
        {
            provide: NG_VALUE_ACCESSOR,
            // tslint:disable-next-line:no-forward-ref
            useExisting: forwardRef(() => NgxLibphonenumberComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useValue: phoneNumberValidator,
            multi: true,
        },
    ], viewQueries: [{ propertyName: "countryList", first: true, predicate: ["countryList"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div class=\"iti iti--allow-dropdown\" [ngClass]=\"separateDialCodeClass\">\n  <div\n    class=\"iti__flag-container\"\n    dropdown\n    [ngClass]=\"{ disabled: disabled }\"\n    [isDisabled]=\"disabled\"\n  >\n    <div class=\"iti__selected-flag dropdown-toggle\" dropdownToggle>\n      <div class=\"iti__flag\" [ngClass]=\"selectedCountry.flagClass || ''\"></div>\n      <div *ngIf=\"separateDialCode\" class=\"selected-dial-code\">\n        +{{ selectedCountry.dialCode }}\n      </div>\n      <div class=\"iti__arrow\"></div>\n    </div>\n    <div *dropdownMenu class=\"dropdown-menu country-dropdown\">\n      <div\n        class=\"search-container\"\n        *ngIf=\"searchCountryFlag && searchCountryField\"\n      >\n        <input\n          id=\"country-search-box\"\n          [(ngModel)]=\"countrySearchText\"\n          (keyup)=\"searchCountry()\"\n          (click)=\"$event.stopPropagation()\"\n          [placeholder]=\"searchCountryPlaceholder\"\n          autofocus\n        />\n      </div>\n      <ul class=\"iti__country-list\" #countryList>\n        <li\n          class=\"iti__country iti__preferred\"\n          *ngFor=\"let country of preferredCountriesInDropDown\"\n          (click)=\"onCountrySelect(country, focusable)\"\n          [id]=\"country.htmlId + '-preferred'\"\n        >\n          <div class=\"iti__flag-box\">\n            <div class=\"iti__flag\" [ngClass]=\"country.flagClass\"></div>\n          </div>\n          <span class=\"iti__country-name\">{{ country.name }}</span>\n          <span class=\"iti__dial-code\">+{{ country.dialCode }}</span>\n        </li>\n        <li\n          class=\"iti__divider\"\n          *ngIf=\"preferredCountriesInDropDown?.length\"\n        ></li>\n        <li\n          class=\"iti__country iti__standard\"\n          *ngFor=\"let country of allCountries\"\n          (click)=\"onCountrySelect(country, focusable)\"\n          [id]=\"country.htmlId\"\n        >\n          <div class=\"iti__flag-box\">\n            <div class=\"iti__flag\" [ngClass]=\"country.flagClass\"></div>\n          </div>\n          <span class=\"iti__country-name\">{{ country.name }}</span>\n          <span class=\"iti__dial-code\">+{{ country.dialCode }}</span>\n        </li>\n      </ul>\n    </div>\n  </div>\n  <input\n    type=\"tel\"\n    [id]=\"inputId\"\n    autocomplete=\"off\"\n    [ngClass]=\"cssClass\"\n    (blur)=\"onTouched()\"\n    (keypress)=\"onInputKeyPress($event)\"\n    [(ngModel)]=\"phoneNumber\"\n    (ngModelChange)=\"onPhoneNumberChange()\"\n    [disabled]=\"disabled\"\n    [placeholder]=\"resolvePlaceholder()\"\n    [attr.maxLength]=\"maxLength\"\n    [attr.validation]=\"phoneValidation\"\n    #focusable\n  />\n</div>\n", styles: [".dropup,.dropright,.dropdown,.dropleft{position:relative}.dropdown-toggle{white-space:nowrap}.dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid;border-right:.3em solid transparent;border-bottom:0;border-left:.3em solid transparent}.dropdown-toggle:empty:after{margin-left:0}.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:1rem;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25rem}.dropdown-menu-left{right:auto;left:0}.dropdown-menu-right{right:0;left:auto}@media (min-width: 576px){.dropdown-menu-sm-left{right:auto;left:0}.dropdown-menu-sm-right{right:0;left:auto}}@media (min-width: 768px){.dropdown-menu-md-left{right:auto;left:0}.dropdown-menu-md-right{right:0;left:auto}}@media (min-width: 992px){.dropdown-menu-lg-left{right:auto;left:0}.dropdown-menu-lg-right{right:0;left:auto}}@media (min-width: 1200px){.dropdown-menu-xl-left{right:auto;left:0}.dropdown-menu-xl-right{right:0;left:auto}}.dropup .dropdown-menu{top:auto;bottom:100%;margin-top:0;margin-bottom:.125rem}.dropup .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:0;border-right:.3em solid transparent;border-bottom:.3em solid;border-left:.3em solid transparent}.dropup .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-menu{top:0;right:auto;left:100%;margin-top:0;margin-left:.125rem}.dropright .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid transparent;border-right:0;border-bottom:.3em solid transparent;border-left:.3em solid}.dropright .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-toggle:after{vertical-align:0}.dropleft .dropdown-menu{top:0;right:100%;left:auto;margin-top:0;margin-right:.125rem}.dropleft .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\"}.dropleft .dropdown-toggle:after{display:none}.dropleft .dropdown-toggle:before{display:inline-block;margin-right:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid transparent;border-right:.3em solid;border-bottom:.3em solid transparent}.dropleft .dropdown-toggle:empty:after{margin-left:0}.dropleft .dropdown-toggle:before{vertical-align:0}.dropdown-menu[x-placement^=top],.dropdown-menu[x-placement^=right],.dropdown-menu[x-placement^=bottom],.dropdown-menu[x-placement^=left]{right:auto;bottom:auto}.dropdown-divider{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid #e9ecef}.dropdown-item{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.dropdown-item:hover,.dropdown-item:focus{color:#16181b;text-decoration:none;background-color:#f8f9fa}.dropdown-item.active,.dropdown-item:active{color:#fff;text-decoration:none;background-color:#007bff}.dropdown-item.disabled,.dropdown-item:disabled{color:#6c757d;pointer-events:none;background-color:transparent}.dropdown-menu.show{display:block}.dropdown-header{display:block;padding:.5rem 1.5rem;margin-bottom:0;font-size:.875rem;color:#6c757d;white-space:nowrap}.dropdown-item-text{display:block;padding:.25rem 1.5rem;color:#212529}\n", ""], dependencies: [{ kind: "directive", type: i2.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i4.BsDropdownMenuDirective, selector: "[bsDropdownMenu],[dropdownMenu]", exportAs: ["bs-dropdown-menu"] }, { kind: "directive", type: i4.BsDropdownToggleDirective, selector: "[bsDropdownToggle],[dropdownToggle]", exportAs: ["bs-dropdown-toggle"] }, { kind: "directive", type: i4.BsDropdownDirective, selector: "[bsDropdown], [dropdown]", inputs: ["placement", "triggers", "container", "dropup", "autoClose", "isAnimated", "insideClick", "isDisabled", "isOpen"], outputs: ["isOpenChange", "onShown", "onHidden"], exportAs: ["bs-dropdown"] }, { kind: "directive", type: i5.NativeElementInjectorDirective, selector: "[ngModel], [formControl], [formControlName]" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-ngx-libphonenumber', providers: [
                        CountryCode,
                        {
                            provide: NG_VALUE_ACCESSOR,
                            // tslint:disable-next-line:no-forward-ref
                            useExisting: forwardRef(() => NgxLibphonenumberComponent),
                            multi: true,
                        },
                        {
                            provide: NG_VALIDATORS,
                            useValue: phoneNumberValidator,
                            multi: true,
                        },
                    ], template: "<div class=\"iti iti--allow-dropdown\" [ngClass]=\"separateDialCodeClass\">\n  <div\n    class=\"iti__flag-container\"\n    dropdown\n    [ngClass]=\"{ disabled: disabled }\"\n    [isDisabled]=\"disabled\"\n  >\n    <div class=\"iti__selected-flag dropdown-toggle\" dropdownToggle>\n      <div class=\"iti__flag\" [ngClass]=\"selectedCountry.flagClass || ''\"></div>\n      <div *ngIf=\"separateDialCode\" class=\"selected-dial-code\">\n        +{{ selectedCountry.dialCode }}\n      </div>\n      <div class=\"iti__arrow\"></div>\n    </div>\n    <div *dropdownMenu class=\"dropdown-menu country-dropdown\">\n      <div\n        class=\"search-container\"\n        *ngIf=\"searchCountryFlag && searchCountryField\"\n      >\n        <input\n          id=\"country-search-box\"\n          [(ngModel)]=\"countrySearchText\"\n          (keyup)=\"searchCountry()\"\n          (click)=\"$event.stopPropagation()\"\n          [placeholder]=\"searchCountryPlaceholder\"\n          autofocus\n        />\n      </div>\n      <ul class=\"iti__country-list\" #countryList>\n        <li\n          class=\"iti__country iti__preferred\"\n          *ngFor=\"let country of preferredCountriesInDropDown\"\n          (click)=\"onCountrySelect(country, focusable)\"\n          [id]=\"country.htmlId + '-preferred'\"\n        >\n          <div class=\"iti__flag-box\">\n            <div class=\"iti__flag\" [ngClass]=\"country.flagClass\"></div>\n          </div>\n          <span class=\"iti__country-name\">{{ country.name }}</span>\n          <span class=\"iti__dial-code\">+{{ country.dialCode }}</span>\n        </li>\n        <li\n          class=\"iti__divider\"\n          *ngIf=\"preferredCountriesInDropDown?.length\"\n        ></li>\n        <li\n          class=\"iti__country iti__standard\"\n          *ngFor=\"let country of allCountries\"\n          (click)=\"onCountrySelect(country, focusable)\"\n          [id]=\"country.htmlId\"\n        >\n          <div class=\"iti__flag-box\">\n            <div class=\"iti__flag\" [ngClass]=\"country.flagClass\"></div>\n          </div>\n          <span class=\"iti__country-name\">{{ country.name }}</span>\n          <span class=\"iti__dial-code\">+{{ country.dialCode }}</span>\n        </li>\n      </ul>\n    </div>\n  </div>\n  <input\n    type=\"tel\"\n    [id]=\"inputId\"\n    autocomplete=\"off\"\n    [ngClass]=\"cssClass\"\n    (blur)=\"onTouched()\"\n    (keypress)=\"onInputKeyPress($event)\"\n    [(ngModel)]=\"phoneNumber\"\n    (ngModelChange)=\"onPhoneNumberChange()\"\n    [disabled]=\"disabled\"\n    [placeholder]=\"resolvePlaceholder()\"\n    [attr.maxLength]=\"maxLength\"\n    [attr.validation]=\"phoneValidation\"\n    #focusable\n  />\n</div>\n", styles: [".dropup,.dropright,.dropdown,.dropleft{position:relative}.dropdown-toggle{white-space:nowrap}.dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid;border-right:.3em solid transparent;border-bottom:0;border-left:.3em solid transparent}.dropdown-toggle:empty:after{margin-left:0}.dropdown-menu{position:absolute;top:100%;left:0;z-index:1000;display:none;float:left;min-width:10rem;padding:.5rem 0;margin:.125rem 0 0;font-size:1rem;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.15);border-radius:.25rem}.dropdown-menu-left{right:auto;left:0}.dropdown-menu-right{right:0;left:auto}@media (min-width: 576px){.dropdown-menu-sm-left{right:auto;left:0}.dropdown-menu-sm-right{right:0;left:auto}}@media (min-width: 768px){.dropdown-menu-md-left{right:auto;left:0}.dropdown-menu-md-right{right:0;left:auto}}@media (min-width: 992px){.dropdown-menu-lg-left{right:auto;left:0}.dropdown-menu-lg-right{right:0;left:auto}}@media (min-width: 1200px){.dropdown-menu-xl-left{right:auto;left:0}.dropdown-menu-xl-right{right:0;left:auto}}.dropup .dropdown-menu{top:auto;bottom:100%;margin-top:0;margin-bottom:.125rem}.dropup .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:0;border-right:.3em solid transparent;border-bottom:.3em solid;border-left:.3em solid transparent}.dropup .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-menu{top:0;right:auto;left:100%;margin-top:0;margin-left:.125rem}.dropright .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid transparent;border-right:0;border-bottom:.3em solid transparent;border-left:.3em solid}.dropright .dropdown-toggle:empty:after{margin-left:0}.dropright .dropdown-toggle:after{vertical-align:0}.dropleft .dropdown-menu{top:0;right:100%;left:auto;margin-top:0;margin-right:.125rem}.dropleft .dropdown-toggle:after{display:inline-block;margin-left:.255em;vertical-align:.255em;content:\"\"}.dropleft .dropdown-toggle:after{display:none}.dropleft .dropdown-toggle:before{display:inline-block;margin-right:.255em;vertical-align:.255em;content:\"\";border-top:.3em solid transparent;border-right:.3em solid;border-bottom:.3em solid transparent}.dropleft .dropdown-toggle:empty:after{margin-left:0}.dropleft .dropdown-toggle:before{vertical-align:0}.dropdown-menu[x-placement^=top],.dropdown-menu[x-placement^=right],.dropdown-menu[x-placement^=bottom],.dropdown-menu[x-placement^=left]{right:auto;bottom:auto}.dropdown-divider{height:0;margin:.5rem 0;overflow:hidden;border-top:1px solid #e9ecef}.dropdown-item{display:block;width:100%;padding:.25rem 1.5rem;clear:both;font-weight:400;color:#212529;text-align:inherit;white-space:nowrap;background-color:transparent;border:0}.dropdown-item:hover,.dropdown-item:focus{color:#16181b;text-decoration:none;background-color:#f8f9fa}.dropdown-item.active,.dropdown-item:active{color:#fff;text-decoration:none;background-color:#007bff}.dropdown-item.disabled,.dropdown-item:disabled{color:#6c757d;pointer-events:none;background-color:transparent}.dropdown-menu.show{display:block}.dropdown-header{display:block;padding:.5rem 1.5rem;margin-bottom:0;font-size:.875rem;color:#6c757d;white-space:nowrap}.dropdown-item-text{display:block;padding:.25rem 1.5rem;color:#212529}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.CountryCode }]; }, propDecorators: { value: [{
                type: Input
            }], preferredCountries: [{
                type: Input
            }], enablePlaceholder: [{
                type: Input
            }], customPlaceholder: [{
                type: Input
            }], numberFormat: [{
                type: Input
            }], cssClass: [{
                type: Input
            }], onlyCountries: [{
                type: Input
            }], enableAutoCountrySelect: [{
                type: Input
            }], searchCountryFlag: [{
                type: Input
            }], searchCountryField: [{
                type: Input
            }], searchCountryPlaceholder: [{
                type: Input
            }], maxLength: [{
                type: Input
            }], selectFirstCountry: [{
                type: Input
            }], selectedCountryISO: [{
                type: Input
            }], phoneValidation: [{
                type: Input
            }], inputId: [{
                type: Input
            }], separateDialCode: [{
                type: Input
            }], countryChange: [{
                type: Output
            }], countryList: [{
                type: ViewChild,
                args: ['countryList']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWxpYnBob25lbnVtYmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1saWJwaG9uZW51bWJlci9zcmMvbGliL25neC1saWJwaG9uZW51bWJlci5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtbGlicGhvbmVudW1iZXIvc3JjL2xpYi9uZ3gtbGlicGhvbmVudW1iZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQztBQUU3QyxPQUFPLEVBQ0wsU0FBUyxFQUVULFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUdMLE1BQU0sRUFFTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHdkUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7Ozs7Ozs7QUF3QnJFLE1BQU0sT0FBTywwQkFBMEI7SUFtRHJDLFlBQW9CLGVBQTRCO1FBQTVCLG9CQUFlLEdBQWYsZUFBZSxDQUFhO1FBbER2QyxVQUFLLEdBQXVCLEVBQUUsQ0FBQztRQUMvQix1QkFBa0IsR0FBa0IsRUFBRSxDQUFDO1FBQ3ZDLHNCQUFpQixHQUFHLElBQUksQ0FBQztRQUd6QixpQkFBWSxHQUFzQixpQkFBaUIsQ0FBQyxhQUFhLENBQUM7UUFDbEUsYUFBUSxHQUFHLGNBQWMsQ0FB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QS9CLEtBQUs7Z0JBQ0csaUJBQWlCO3NCQUF6QixLQUFLO2dCQUNHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFDRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBRU4sU0FBUztzQkFEUixLQUFLO2dCQUVHLGtCQUFrQjtzQkFBMUIsS0FBSztnQkFFTixrQkFBa0I7c0JBRGpCLEtBQUs7Z0JBRUcsZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csZ0JBQWdCO3NCQUF4QixLQUFLO2dCQUdhLGFBQWE7c0JBQS9CLE1BQU07Z0JBdUJQLFdBQVc7c0JBRFYsU0FBUzt1QkFBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbHBuIGZyb20gJ2dvb2dsZS1saWJwaG9uZW51bWJlcic7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBmb3J3YXJkUmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5HX1ZBTElEQVRPUlMsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBzZXRUaGVtZSB9IGZyb20gJ25neC1ib290c3RyYXAvdXRpbHMnO1xuXG5pbXBvcnQgeyBDb3VudHJ5Q29kZSB9IGZyb20gJy4vZGF0YS9jb3VudHJ5LWNvZGUnO1xuaW1wb3J0IHsgQ291bnRyeUlTTyB9IGZyb20gJy4vZW51bXMvY291bnRyeS1pc28uZW51bSc7XG5pbXBvcnQgeyBTZWFyY2hDb3VudHJ5RmllbGQgfSBmcm9tICcuL2VudW1zL3NlYXJjaC1jb3VudHJ5LWZpZWxkLmVudW0nO1xuaW1wb3J0IHsgQ2hhbmdlRGF0YSB9IGZyb20gJy4vaW50ZXJmYWNlcy9jaGFuZ2UtZGF0YSc7XG5pbXBvcnQgeyBDb3VudHJ5IH0gZnJvbSAnLi9tb2RlbC9jb3VudHJ5Lm1vZGVsJztcbmltcG9ydCB7IHBob25lTnVtYmVyVmFsaWRhdG9yIH0gZnJvbSAnLi9uZ3gtbGlicGhvbmVudW1iZXIudmFsaWRhdG9yJztcbmltcG9ydCB7IFBob25lTnVtYmVyRm9ybWF0IH0gZnJvbSAnLi9lbnVtcy9waG9uZS1udW1iZXItZm9ybWF0LmVudW0nO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItbmd4LWxpYnBob25lbnVtYmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1saWJwaG9uZW51bWJlci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogW1xuICAgICcuL2Jvb3RzdHJhcC1kcm9wZG93bi5jc3MnLFxuICAgICcuL25neC1saWJwaG9uZW51bWJlci5jb21wb25lbnQuc2NzcycsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIENvdW50cnlDb2RlLFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWZvcndhcmQtcmVmXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ3hMaWJwaG9uZW51bWJlckNvbXBvbmVudCksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgICB1c2VWYWx1ZTogcGhvbmVOdW1iZXJWYWxpZGF0b3IsXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hMaWJwaG9uZW51bWJlckNvbXBvbmVudCB7XG4gIEBJbnB1dCgpIHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnJztcbiAgQElucHV0KCkgcHJlZmVycmVkQ291bnRyaWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gIEBJbnB1dCgpIGVuYWJsZVBsYWNlaG9sZGVyID0gdHJ1ZTtcbiAgQElucHV0KClcbiAgY3VzdG9tUGxhY2Vob2xkZXIhOiBzdHJpbmc7XG4gIEBJbnB1dCgpIG51bWJlckZvcm1hdDogUGhvbmVOdW1iZXJGb3JtYXQgPSBQaG9uZU51bWJlckZvcm1hdC5JbnRlcm5hdGlvbmFsO1xuICBASW5wdXQoKSBjc3NDbGFzcyA9ICdmb3JtLWNvbnRyb2wnO1xuICBASW5wdXQoKSBvbmx5Q291bnRyaWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gIEBJbnB1dCgpIGVuYWJsZUF1dG9Db3VudHJ5U2VsZWN0ID0gdHJ1ZTtcbiAgQElucHV0KCkgc2VhcmNoQ291bnRyeUZsYWcgPSBmYWxzZTtcbiAgQElucHV0KCkgc2VhcmNoQ291bnRyeUZpZWxkOiBTZWFyY2hDb3VudHJ5RmllbGRbXSA9IFtTZWFyY2hDb3VudHJ5RmllbGQuQWxsXTtcbiAgQElucHV0KCkgc2VhcmNoQ291bnRyeVBsYWNlaG9sZGVyID0gJ1NlYXJjaCBDb3VudHJ5JztcbiAgQElucHV0KClcbiAgbWF4TGVuZ3RoITogbnVtYmVyO1xuICBASW5wdXQoKSBzZWxlY3RGaXJzdENvdW50cnkgPSB0cnVlO1xuICBASW5wdXQoKVxuICBzZWxlY3RlZENvdW50cnlJU08hOiBDb3VudHJ5SVNPO1xuICBASW5wdXQoKSBwaG9uZVZhbGlkYXRpb24gPSB0cnVlO1xuICBASW5wdXQoKSBpbnB1dElkID0gJ3Bob25lJztcbiAgQElucHV0KCkgc2VwYXJhdGVEaWFsQ29kZSA9IGZhbHNlO1xuICBzZXBhcmF0ZURpYWxDb2RlQ2xhc3MhOiBzdHJpbmc7XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGNvdW50cnlDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENvdW50cnk+KCk7XG5cbiAgc2VsZWN0ZWRDb3VudHJ5OiBDb3VudHJ5ID0ge1xuICAgIGFyZWFDb2RlczogdW5kZWZpbmVkLFxuICAgIGRpYWxDb2RlOiAnJyxcbiAgICBodG1sSWQ6ICcnLFxuICAgIGZsYWdDbGFzczogJycsXG4gICAgaXNvMjogJycsXG4gICAgbmFtZTogJycsXG4gICAgcGxhY2VIb2xkZXI6ICcnLFxuICAgIHByaW9yaXR5OiAwLFxuICB9O1xuXG4gIHBob25lTnVtYmVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSAnJztcbiAgYWxsQ291bnRyaWVzOiBBcnJheTxDb3VudHJ5PiA9IFtdO1xuICBwcmVmZXJyZWRDb3VudHJpZXNJbkRyb3BEb3duOiBBcnJheTxDb3VudHJ5PiA9IFtdO1xuICAvLyBIYXMgdG8gYmUgJ2FueScgdG8gcHJldmVudCBhIG5lZWQgdG8gaW5zdGFsbCBAdHlwZXMvZ29vZ2xlLWxpYnBob25lbnVtYmVyIGJ5IHRoZSBwYWNrYWdlIHVzZXIuLi5cbiAgcGhvbmVVdGlsOiBhbnkgPSBscG4uUGhvbmVOdW1iZXJVdGlsLmdldEluc3RhbmNlKCk7XG4gIGRpc2FibGVkID0gZmFsc2U7XG4gIGVycm9yczogQXJyYXk8YW55PiA9IFsnUGhvbmUgbnVtYmVyIGlzIHJlcXVpcmVkLiddO1xuICBjb3VudHJ5U2VhcmNoVGV4dCA9ICcnO1xuXG4gIEBWaWV3Q2hpbGQoJ2NvdW50cnlMaXN0JylcbiAgY291bnRyeUxpc3QhOiBFbGVtZW50UmVmO1xuXG4gIG9uVG91Y2hlZCA9ICgpID0+IHt9O1xuICBwcm9wYWdhdGVDaGFuZ2UgPSAoXzogQ2hhbmdlRGF0YSkgPT4ge307XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb3VudHJ5Q29kZURhdGE6IENvdW50cnlDb2RlKSB7XG4gICAgLy8gSWYgdGhpcyBpcyBub3Qgc2V0LCBuZ3gtYm9vdHN0cmFwIHdpbGwgdHJ5IHRvIHVzZSB0aGUgYnMzIENTUyAod2hpY2ggaXMgbm90IHdoYXQgd2UndmUgZW1iZWRkZWQpIGFuZCB3aWxsXG4gICAgLy8gQWRkIHRoZSB3cm9uZyBjbGFzc2VzIGFuZCBzdWNoXG4gICAgc2V0VGhlbWUoJ2JzNCcpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRJU08gPSBjaGFuZ2VzWydzZWxlY3RlZENvdW50cnlJU08nXTtcbiAgICBpZiAoXG4gICAgICB0aGlzLmFsbENvdW50cmllcyAmJlxuICAgICAgc2VsZWN0ZWRJU08gJiZcbiAgICAgIHNlbGVjdGVkSVNPLmN1cnJlbnRWYWx1ZSAhPT0gc2VsZWN0ZWRJU08ucHJldmlvdXNWYWx1ZVxuICAgICkge1xuICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZENvdW50cnkoKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ3ByZWZlcnJlZENvdW50cmllcyddKSB7XG4gICAgICB0aGlzLnVwZGF0ZVByZWZlcnJlZENvdW50cmllcygpO1xuICAgIH1cbiAgICB0aGlzLmNoZWNrU2VwYXJhdGVEaWFsQ29kZVN0eWxlKCk7XG4gIH1cblxuICAvKlxuXHRcdFRoaXMgaXMgYSB3cmFwcGVyIG1ldGhvZCB0byBhdm9pZCBjYWxsaW5nIHRoaXMubmdPbkluaXQoKSBpbiB3cml0ZVZhbHVlKCkuXG5cdFx0UmVmOiBodHRwOi8vY29kZWx5emVyLmNvbS9ydWxlcy9uby1saWZlLWN5Y2xlLWNhbGwvXG5cdCovXG4gIGluaXQoKSB7XG4gICAgdGhpcy5mZXRjaENvdW50cnlEYXRhKCk7XG4gICAgaWYgKHRoaXMucHJlZmVycmVkQ291bnRyaWVzLmxlbmd0aCkge1xuICAgICAgdGhpcy51cGRhdGVQcmVmZXJyZWRDb3VudHJpZXMoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub25seUNvdW50cmllcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYWxsQ291bnRyaWVzID0gdGhpcy5hbGxDb3VudHJpZXMuZmlsdGVyKChjKSA9PlxuICAgICAgICB0aGlzLm9ubHlDb3VudHJpZXMuaW5jbHVkZXMoYy5pc28yKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VsZWN0Rmlyc3RDb3VudHJ5KSB7XG4gICAgICBpZiAodGhpcy5wcmVmZXJyZWRDb3VudHJpZXNJbkRyb3BEb3duLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkQ291bnRyeSh0aGlzLnByZWZlcnJlZENvdW50cmllc0luRHJvcERvd25bMF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3RlZENvdW50cnkodGhpcy5hbGxDb3VudHJpZXNbMF0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkQ291bnRyeSgpO1xuICAgIHRoaXMuY2hlY2tTZXBhcmF0ZURpYWxDb2RlU3R5bGUoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkQ291bnRyeShjb3VudHJ5OiBDb3VudHJ5KSB7XG4gICAgdGhpcy5zZWxlY3RlZENvdW50cnkgPSBjb3VudHJ5O1xuICAgIHRoaXMuY291bnRyeUNoYW5nZS5lbWl0KGNvdW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCBjb3VudHJ5IGJhc2VkIG9uIGNvdW50cnkgbmFtZSwgaXNvMiwgZGlhbENvZGUgb3IgYWxsIG9mIHRoZW0uXG4gICAqL1xuICBwdWJsaWMgc2VhcmNoQ291bnRyeSgpIHtcbiAgICBpZiAoIXRoaXMuY291bnRyeVNlYXJjaFRleHQpIHtcbiAgICAgIHRoaXMuY291bnRyeUxpc3QubmF0aXZlRWxlbWVudFxuICAgICAgICAucXVlcnlTZWxlY3RvcignLml0aV9fY291bnRyeS1saXN0IGxpJylcbiAgICAgICAgLnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgICAgICAgYmxvY2s6ICduZWFyZXN0JyxcbiAgICAgICAgICBpbmxpbmU6ICduZWFyZXN0JyxcbiAgICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvdW50cnlTZWFyY2hUZXh0TG93ZXIgPSB0aGlzLmNvdW50cnlTZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGNvdW50cnkgPSB0aGlzLmFsbENvdW50cmllcy5maWx0ZXIoKGMpID0+IHtcbiAgICAgIGlmICh0aGlzLnNlYXJjaENvdW50cnlGaWVsZC5pbmRleE9mKFNlYXJjaENvdW50cnlGaWVsZC5BbGwpID4gLTEpIHtcbiAgICAgICAgLy8gU2VhcmNoIGluIGFsbCBmaWVsZHNcbiAgICAgICAgaWYgKGMuaXNvMi50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoY291bnRyeVNlYXJjaFRleHRMb3dlcikpIHtcbiAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYy5uYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChjb3VudHJ5U2VhcmNoVGV4dExvd2VyKSkge1xuICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjLmRpYWxDb2RlLnN0YXJ0c1dpdGgodGhpcy5jb3VudHJ5U2VhcmNoVGV4dCkpIHtcbiAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3Igc2VhcmNoIGJ5IHNwZWNpZmljIFNlYXJjaENvdW50cnlGaWVsZChzKVxuICAgICAgICBpZiAodGhpcy5zZWFyY2hDb3VudHJ5RmllbGQuaW5kZXhPZihTZWFyY2hDb3VudHJ5RmllbGQuSXNvMikgPiAtMSkge1xuICAgICAgICAgIGlmIChjLmlzbzIudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKGNvdW50cnlTZWFyY2hUZXh0TG93ZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoQ291bnRyeUZpZWxkLmluZGV4T2YoU2VhcmNoQ291bnRyeUZpZWxkLk5hbWUpID4gLTEpIHtcbiAgICAgICAgICBpZiAoYy5uYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChjb3VudHJ5U2VhcmNoVGV4dExvd2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaENvdW50cnlGaWVsZC5pbmRleE9mKFNlYXJjaENvdW50cnlGaWVsZC5EaWFsQ29kZSkgPiAtMSkge1xuICAgICAgICAgIGlmIChjLmRpYWxDb2RlLnN0YXJ0c1dpdGgodGhpcy5jb3VudHJ5U2VhcmNoVGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGNvdW50cnkubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLmNvdW50cnlMaXN0Lm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJyMnICsgY291bnRyeVswXS5odG1sSWRcbiAgICAgICk7XG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgZWwuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICAgICAgICBibG9jazogJ25lYXJlc3QnLFxuICAgICAgICAgIGlubGluZTogJ25lYXJlc3QnLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrU2VwYXJhdGVEaWFsQ29kZVN0eWxlKCk7XG4gIH1cblxuICBwdWJsaWMgb25QaG9uZU51bWJlckNoYW5nZSgpOiB2b2lkIHtcbiAgICBsZXQgY291bnRyeUNvZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvLyBIYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIHVzZXIgc2V0cyB0aGUgdmFsdWUgcHJvZ3JhbWF0aWNhbGx5IGJhc2VkIG9uIGEgcGVyc2lzdGVkIENoYW5nZURhdGEgb2JqLlxuICAgIGlmICh0aGlzLnBob25lTnVtYmVyICYmIHR5cGVvZiB0aGlzLnBob25lTnVtYmVyID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgbnVtYmVyT2JqOiBDaGFuZ2VEYXRhID0gdGhpcy5waG9uZU51bWJlcjtcbiAgICAgIHRoaXMucGhvbmVOdW1iZXIgPSBudW1iZXJPYmoubnVtYmVyO1xuICAgICAgY291bnRyeUNvZGUgPSBudW1iZXJPYmouY291bnRyeUNvZGU7XG4gICAgfVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMucGhvbmVOdW1iZXI7XG4gICAgY291bnRyeUNvZGUgPSBjb3VudHJ5Q29kZSB8fCB0aGlzLnNlbGVjdGVkQ291bnRyeS5pc28yO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBudW1iZXIgPSB0aGlzLmdldFBhcnNlZE51bWJlcih0aGlzLnBob25lTnVtYmVyLCBjb3VudHJ5Q29kZSk7XG5cbiAgICAvLyBhdXRvIHNlbGVjdCBjb3VudHJ5IGJhc2VkIG9uIHRoZSBleHRlbnNpb24gKGFuZCBhcmVhQ29kZSBpZiBuZWVkZWQpIChlLmcgc2VsZWN0IENhbmFkYSBpZiBudW1iZXIgc3RhcnRzIHdpdGggKzEgNDE2KVxuICAgIGlmICh0aGlzLmVuYWJsZUF1dG9Db3VudHJ5U2VsZWN0KSB7XG4gICAgICBjb3VudHJ5Q29kZSA9XG4gICAgICAgIG51bWJlciAmJiBudW1iZXIuZ2V0Q291bnRyeUNvZGUoKVxuICAgICAgICAgID8gLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGhpcy5nZXRDb3VudHJ5SXNvQ29kZShudW1iZXIuZ2V0Q291bnRyeUNvZGUoKSwgbnVtYmVyKVxuICAgICAgICAgIDogdGhpcy5zZWxlY3RlZENvdW50cnkuaXNvMjtcbiAgICAgIGlmIChjb3VudHJ5Q29kZSAmJiBjb3VudHJ5Q29kZSAhPT0gdGhpcy5zZWxlY3RlZENvdW50cnkuaXNvMikge1xuICAgICAgICBjb25zdCBuZXdDb3VudHJ5ID0gdGhpcy5hbGxDb3VudHJpZXNcbiAgICAgICAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEucHJpb3JpdHkgLSBiLnByaW9yaXR5O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbmQoKGMpID0+IGMuaXNvMiA9PT0gY291bnRyeUNvZGUpO1xuICAgICAgICBpZiAobmV3Q291bnRyeSkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudHJ5ID0gbmV3Q291bnRyeTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb3VudHJ5Q29kZSA9IGNvdW50cnlDb2RlID8gY291bnRyeUNvZGUgOiB0aGlzLnNlbGVjdGVkQ291bnRyeS5pc28yO1xuXG4gICAgdGhpcy5jaGVja1NlcGFyYXRlRGlhbENvZGVTdHlsZSgpO1xuXG4gICAgaWYgKCF0aGlzLnZhbHVlKSB7XG4gICAgICAvLyBSZWFzb246IGF2b2lkIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NDM1ODEzMy8xNjE3NTkwXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLW51bGwta2V5d29yZFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UobnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGludGxObyA9IG51bWJlclxuICAgICAgICA/IHRoaXMucGhvbmVVdGlsLmZvcm1hdChudW1iZXIsIGxwbi5QaG9uZU51bWJlckZvcm1hdC5JTlRFUk5BVElPTkFMKVxuICAgICAgICA6ICcnO1xuXG4gICAgICAvLyBwYXJzZSBwaG9uZU51bWJlciBpZiBzZXBhcmF0ZSBkaWFsIGNvZGUgaXMgbmVlZGVkXG4gICAgICBpZiAodGhpcy5zZXBhcmF0ZURpYWxDb2RlICYmIGludGxObykge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5yZW1vdmVEaWFsQ29kZShpbnRsTm8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZSh7XG4gICAgICAgIG51bWJlcjogdGhpcy52YWx1ZSxcbiAgICAgICAgaW50ZXJuYXRpb25hbE51bWJlcjogaW50bE5vLFxuICAgICAgICBuYXRpb25hbE51bWJlcjogbnVtYmVyXG4gICAgICAgICAgPyB0aGlzLnBob25lVXRpbC5mb3JtYXQobnVtYmVyLCBscG4uUGhvbmVOdW1iZXJGb3JtYXQuTkFUSU9OQUwpXG4gICAgICAgICAgOiAnJyxcbiAgICAgICAgZTE2NE51bWJlcjogbnVtYmVyXG4gICAgICAgICAgPyB0aGlzLnBob25lVXRpbC5mb3JtYXQobnVtYmVyLCBscG4uUGhvbmVOdW1iZXJGb3JtYXQuRTE2NClcbiAgICAgICAgICA6ICcnLFxuICAgICAgICBjb3VudHJ5Q29kZTogY291bnRyeUNvZGUudG9VcHBlckNhc2UoKSxcbiAgICAgICAgZGlhbENvZGU6ICcrJyArIHRoaXMuc2VsZWN0ZWRDb3VudHJ5LmRpYWxDb2RlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uQ291bnRyeVNlbGVjdChjb3VudHJ5OiBDb3VudHJ5LCBlbDogeyBmb2N1czogKCkgPT4gdm9pZCB9KTogdm9pZCB7XG4gICAgdGhpcy5zZXRTZWxlY3RlZENvdW50cnkoY291bnRyeSk7XG5cbiAgICB0aGlzLmNoZWNrU2VwYXJhdGVEaWFsQ29kZVN0eWxlKCk7XG5cbiAgICBpZiAodGhpcy5waG9uZU51bWJlciAmJiB0aGlzLnBob25lTnVtYmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnBob25lTnVtYmVyO1xuICAgICAgY29uc3QgbnVtYmVyID0gdGhpcy5nZXRQYXJzZWROdW1iZXIoXG4gICAgICAgIHRoaXMucGhvbmVOdW1iZXIsXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudHJ5LmlzbzJcbiAgICAgICk7XG4gICAgICBjb25zdCBpbnRsTm8gPSBudW1iZXJcbiAgICAgICAgPyB0aGlzLnBob25lVXRpbC5mb3JtYXQobnVtYmVyLCBscG4uUGhvbmVOdW1iZXJGb3JtYXQuSU5URVJOQVRJT05BTClcbiAgICAgICAgOiAnJztcbiAgICAgIC8vIHBhcnNlIHBob25lTnVtYmVyIGlmIHNlcGFyYXRlIGRpYWwgY29kZSBpcyBuZWVkZWRcbiAgICAgIGlmICh0aGlzLnNlcGFyYXRlRGlhbENvZGUgJiYgaW50bE5vKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnJlbW92ZURpYWxDb2RlKGludGxObyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHtcbiAgICAgICAgbnVtYmVyOiB0aGlzLnZhbHVlLFxuICAgICAgICBpbnRlcm5hdGlvbmFsTnVtYmVyOiBpbnRsTm8sXG4gICAgICAgIG5hdGlvbmFsTnVtYmVyOiBudW1iZXJcbiAgICAgICAgICA/IHRoaXMucGhvbmVVdGlsLmZvcm1hdChudW1iZXIsIGxwbi5QaG9uZU51bWJlckZvcm1hdC5OQVRJT05BTClcbiAgICAgICAgICA6ICcnLFxuICAgICAgICBlMTY0TnVtYmVyOiBudW1iZXJcbiAgICAgICAgICA/IHRoaXMucGhvbmVVdGlsLmZvcm1hdChudW1iZXIsIGxwbi5QaG9uZU51bWJlckZvcm1hdC5FMTY0KVxuICAgICAgICAgIDogJycsXG4gICAgICAgIGNvdW50cnlDb2RlOiB0aGlzLnNlbGVjdGVkQ291bnRyeS5pc28yLnRvVXBwZXJDYXNlKCksXG4gICAgICAgIGRpYWxDb2RlOiAnKycgKyB0aGlzLnNlbGVjdGVkQ291bnRyeS5kaWFsQ29kZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZWFzb246IGF2b2lkIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NDM1ODEzMy8xNjE3NTkwXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLW51bGwta2V5d29yZFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5wcm9wYWdhdGVDaGFuZ2UobnVsbCk7XG4gICAgfVxuXG4gICAgZWwuZm9jdXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBvbklucHV0S2V5UHJlc3MoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBhbGxvd2VkQ2hhcnMgPSAvWzAtOVxcK1xcLVxcKFxcKVxcIF0vO1xuICAgIGNvbnN0IGFsbG93ZWRDdHJsQ2hhcnMgPSAvW2F4Y3ZdLzsgLy8gQWxsb3dzIGNvcHktcGFzdGluZ1xuICAgIGNvbnN0IGFsbG93ZWRPdGhlcktleXMgPSBbXG4gICAgICAnQXJyb3dMZWZ0JyxcbiAgICAgICdBcnJvd1VwJyxcbiAgICAgICdBcnJvd1JpZ2h0JyxcbiAgICAgICdBcnJvd0Rvd24nLFxuICAgICAgJ0hvbWUnLFxuICAgICAgJ0VuZCcsXG4gICAgICAnSW5zZXJ0JyxcbiAgICAgICdEZWxldGUnLFxuICAgICAgJ0JhY2tzcGFjZScsXG4gICAgXTtcblxuICAgIGlmIChcbiAgICAgICFhbGxvd2VkQ2hhcnMudGVzdChldmVudC5rZXkpICYmXG4gICAgICAhKGV2ZW50LmN0cmxLZXkgJiYgYWxsb3dlZEN0cmxDaGFycy50ZXN0KGV2ZW50LmtleSkpICYmXG4gICAgICAhYWxsb3dlZE90aGVyS2V5cy5pbmNsdWRlcyhldmVudC5rZXkpXG4gICAgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KSB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgd3JpdGVWYWx1ZShvYmo6IGFueSk6IHZvaWQge1xuICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICAgIHRoaXMucGhvbmVOdW1iZXIgPSBvYmo7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm9uUGhvbmVOdW1iZXJDaGFuZ2UoKTtcbiAgICB9LCAxKTtcbiAgfVxuXG4gIHJlc29sdmVQbGFjZWhvbGRlcigpOiBzdHJpbmcge1xuICAgIGxldCBwbGFjZWhvbGRlciA9ICcnO1xuICAgIGlmICh0aGlzLmN1c3RvbVBsYWNlaG9sZGVyKSB7XG4gICAgICBwbGFjZWhvbGRlciA9IHRoaXMuY3VzdG9tUGxhY2Vob2xkZXI7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkQ291bnRyeS5wbGFjZUhvbGRlcikge1xuICAgICAgcGxhY2Vob2xkZXIgPSB0aGlzLnNlbGVjdGVkQ291bnRyeS5wbGFjZUhvbGRlcjtcbiAgICAgIGlmICh0aGlzLnNlcGFyYXRlRGlhbENvZGUpIHtcbiAgICAgICAgcGxhY2Vob2xkZXIgPSB0aGlzLnJlbW92ZURpYWxDb2RlKHBsYWNlaG9sZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xuICB9XG5cbiAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgLyoqXG4gICAqIFJldHVybnMgcGFyc2UgUGhvbmVOdW1iZXIgb2JqZWN0LlxuICAgKiBAcGFyYW0gcGhvbmVOdW1iZXIgc3RyaW5nXG4gICAqIEBwYXJhbSBjb3VudHJ5Q29kZSBzdHJpbmdcbiAgICovXG4gIHByaXZhdGUgZ2V0UGFyc2VkTnVtYmVyKFxuICAgIHBob25lTnVtYmVyOiBzdHJpbmcsXG4gICAgY291bnRyeUNvZGU6IHN0cmluZ1xuICApOiBscG4uUGhvbmVOdW1iZXIge1xuICAgIGxldCBudW1iZXI6IGxwbi5QaG9uZU51bWJlcjtcbiAgICB0cnkge1xuICAgICAgbnVtYmVyID0gdGhpcy5waG9uZVV0aWwucGFyc2UocGhvbmVOdW1iZXIsIGNvdW50cnlDb2RlLnRvVXBwZXJDYXNlKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBudW1iZXI7XG4gIH1cblxuICAvKipcbiAgICogQWRqdXN0cyBpbnB1dCBhbGlnbm1lbnQgYmFzZWQgb24gdGhlIGRpYWwgY29kZSBwcmVzZW50YXRpb24gc3R5bGUuXG4gICAqL1xuICBwcml2YXRlIGNoZWNrU2VwYXJhdGVEaWFsQ29kZVN0eWxlKCkge1xuICAgIGlmICh0aGlzLnNlcGFyYXRlRGlhbENvZGUgJiYgdGhpcy5zZWxlY3RlZENvdW50cnkpIHtcbiAgICAgIGNvbnN0IGNudHJ5Q2QgPSB0aGlzLnNlbGVjdGVkQ291bnRyeS5kaWFsQ29kZTtcbiAgICAgIHRoaXMuc2VwYXJhdGVEaWFsQ29kZUNsYXNzID1cbiAgICAgICAgJ3NlcGFyYXRlLWRpYWwtY29kZSBpdGktc2RjLScgKyAoY250cnlDZC5sZW5ndGggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXBhcmF0ZURpYWxDb2RlQ2xhc3MgPSAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIGRpYWxjb2RlIGZyb20gcGhvbmUgbnVtYmVyIHN0cmluZy5cbiAgICogQHBhcmFtIHBob25lTnVtYmVyIHN0cmluZ1xuICAgKi9cbiAgcHJpdmF0ZSByZW1vdmVEaWFsQ29kZShwaG9uZU51bWJlcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBudW1iZXIgPSB0aGlzLmdldFBhcnNlZE51bWJlcihwaG9uZU51bWJlciwgdGhpcy5zZWxlY3RlZENvdW50cnkuaXNvMik7XG4gICAgcGhvbmVOdW1iZXIgPSB0aGlzLnBob25lVXRpbC5mb3JtYXQoXG4gICAgICBudW1iZXIsXG4gICAgICBscG4uUGhvbmVOdW1iZXJGb3JtYXRbdGhpcy5udW1iZXJGb3JtYXRdXG4gICAgKTtcbiAgICBpZiAocGhvbmVOdW1iZXIuc3RhcnRzV2l0aCgnKycpICYmIHRoaXMuc2VwYXJhdGVEaWFsQ29kZSkge1xuICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5zdWJzdHIocGhvbmVOdW1iZXIuaW5kZXhPZignICcpICsgMSk7XG4gICAgfVxuICAgIHJldHVybiBwaG9uZU51bWJlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWZ0cyB0aHJvdWdoIGFsbCBjb3VudHJpZXMgYW5kIHJldHVybnMgaXNvIGNvZGUgb2YgdGhlIHByaW1hcnkgY291bnRyeVxuICAgKiBiYXNlZCBvbiB0aGUgbnVtYmVyIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0gY291bnRyeUNvZGUgY291bnRyeSBjb2RlIGluIG51bWJlciBmb3JtYXRcbiAgICogQHBhcmFtIG51bWJlciBQaG9uZU51bWJlciBvYmplY3RcbiAgICovXG4gIHByaXZhdGUgZ2V0Q291bnRyeUlzb0NvZGUoXG4gICAgY291bnRyeUNvZGU6IG51bWJlcixcbiAgICBudW1iZXI6IGxwbi5QaG9uZU51bWJlclxuICApOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIC8vIFdpbGwgdXNlIHRoaXMgdG8gbWF0Y2ggYXJlYSBjb2RlIGZyb20gdGhlIGZpcnN0IG51bWJlcnNcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgcmF3TnVtYmVyID0gbnVtYmVyWyd2YWx1ZXNfJ11bJzInXS50b1N0cmluZygpO1xuICAgIC8vIExpc3Qgb2YgYWxsIGNvdW50cmllcyB3aXRoIGNvdW50cnlDb2RlIChjYW4gYmUgbW9yZSB0aGFuIG9uZS4gZS54LiBVUywgQ0EsIERPLCBQUiBhbGwgaGF2ZSArMSBjb3VudHJ5Q29kZSlcbiAgICBjb25zdCBjb3VudHJpZXMgPSB0aGlzLmFsbENvdW50cmllcy5maWx0ZXIoXG4gICAgICAoYykgPT4gYy5kaWFsQ29kZSA9PT0gY291bnRyeUNvZGUudG9TdHJpbmcoKVxuICAgICk7XG4gICAgLy8gTWFpbiBjb3VudHJ5IGlzIHRoZSBjb3VudHJ5LCB3aGljaCBoYXMgbm8gYXJlYUNvZGVzIHNwZWNpZmllZCBpbiBjb3VudHJ5LWNvZGUudHMgZmlsZS5cbiAgICBjb25zdCBtYWluQ291bnRyeSA9IGNvdW50cmllcy5maW5kKChjKSA9PiBjLmFyZWFDb2RlcyA9PT0gdW5kZWZpbmVkKTtcbiAgICAvLyBTZWNvbmRhcnkgY291bnRyaWVzIGFyZSBhbGwgY291bnRyaWVzLCB3aGljaCBoYXZlIGFyZWFDb2RlcyBzcGVjaWZpZWQgaW4gY291bnRyeS1jb2RlLnRzIGZpbGUuXG4gICAgY29uc3Qgc2Vjb25kYXJ5Q291bnRyaWVzID0gY291bnRyaWVzLmZpbHRlcihcbiAgICAgIChjKSA9PiBjLmFyZWFDb2RlcyAhPT0gdW5kZWZpbmVkXG4gICAgKTtcbiAgICBsZXQgbWF0Y2hlZENvdW50cnkgPSBtYWluQ291bnRyeSA/IG1haW5Db3VudHJ5LmlzbzIgOiB1bmRlZmluZWQ7XG5cbiAgICAvKlxuXHRcdFx0SXRlcmF0ZSBvdmVyIGVhY2ggc2Vjb25kYXJ5IGNvdW50cnkgYW5kIGNoZWNrIGlmIG5hdGlvbmFsTnVtYmVyIHN0YXJ0cyB3aXRoIGFueSBvZiBhcmVhQ29kZXMgYXZhaWxhYmxlLlxuXHRcdFx0SWYgbm8gbWF0Y2hlcyBmb3VuZCwgZmFsbGJhY2sgdG8gdGhlIG1haW4gY291bnRyeS5cblx0XHQqL1xuICAgIHNlY29uZGFyeUNvdW50cmllcy5mb3JFYWNoKChjb3VudHJ5KSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBjb3VudHJ5LmFyZWFDb2Rlcy5mb3JFYWNoKChhcmVhQ29kZSkgPT4ge1xuICAgICAgICBpZiAocmF3TnVtYmVyLnN0YXJ0c1dpdGgoYXJlYUNvZGUpKSB7XG4gICAgICAgICAgbWF0Y2hlZENvdW50cnkgPSBjb3VudHJ5LmlzbzI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1hdGNoZWRDb3VudHJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgZm9ybWF0dGVkIGV4YW1wbGUgcGhvbmUgbnVtYmVyIGZyb20gcGhvbmVVdGlsLlxuICAgKiBAcGFyYW0gY291bnRyeUNvZGUgc3RyaW5nXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0UGhvbmVOdW1iZXJQbGFjZUhvbGRlcihjb3VudHJ5Q29kZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMucGhvbmVVdGlsLmZvcm1hdChcbiAgICAgICAgdGhpcy5waG9uZVV0aWwuZ2V0RXhhbXBsZU51bWJlcihjb3VudHJ5Q29kZSksXG4gICAgICAgIGxwbi5QaG9uZU51bWJlckZvcm1hdFt0aGlzLm51bWJlckZvcm1hdF1cbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyaW5nIHRoZSBsaXN0IHRvIGF2b2lkIGR1cGxpY2F0ZXMgKGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjYXQxMjM0NS9uZ3gtaW50bC10ZWwtaW5wdXQvaXNzdWVzLzI0OClcbiAgICovXG4gIHByb3RlY3RlZCBmZXRjaENvdW50cnlEYXRhKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsQ291bnRyaWVzID0gW107XG5cbiAgICB0aGlzLmNvdW50cnlDb2RlRGF0YS5hbGxDb3VudHJpZXMuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY291bnRyeTogQ291bnRyeSA9IHtcbiAgICAgICAgbmFtZTogY1swXS50b1N0cmluZygpLFxuICAgICAgICBpc28yOiBjWzFdLnRvU3RyaW5nKCksXG4gICAgICAgIGRpYWxDb2RlOiBjWzJdLnRvU3RyaW5nKCksXG4gICAgICAgIHByaW9yaXR5OiArY1szXSB8fCAwLFxuICAgICAgICBhcmVhQ29kZXM6IChjWzRdIGFzIHN0cmluZ1tdKSB8fCB1bmRlZmluZWQsXG4gICAgICAgIGh0bWxJZDogYGl0aS0wX19pdGVtLSR7Y1sxXS50b1N0cmluZygpfWAsXG4gICAgICAgIGZsYWdDbGFzczogYGl0aV9fJHtjWzFdLnRvU3RyaW5nKCkudG9Mb2NhbGVMb3dlckNhc2UoKX1gLFxuICAgICAgICBwbGFjZUhvbGRlcjogJycsXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5lbmFibGVQbGFjZWhvbGRlcikge1xuICAgICAgICBjb3VudHJ5LnBsYWNlSG9sZGVyID0gdGhpcy5nZXRQaG9uZU51bWJlclBsYWNlSG9sZGVyKFxuICAgICAgICAgIGNvdW50cnkuaXNvMi50b1VwcGVyQ2FzZSgpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWxsQ291bnRyaWVzLnB1c2goY291bnRyeSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUG9wdWxhdGVzIHByZWZlcnJlZENvdW50cmllc0luRHJvcERvd24gd2l0aCBwcmVmZmVycmVkIGNvdW50cmllcy5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlUHJlZmVycmVkQ291bnRyaWVzKCkge1xuICAgIGlmICh0aGlzLnByZWZlcnJlZENvdW50cmllcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucHJlZmVycmVkQ291bnRyaWVzSW5Ecm9wRG93biA9IFtdO1xuICAgICAgdGhpcy5wcmVmZXJyZWRDb3VudHJpZXMuZm9yRWFjaCgoaXNvMikgPT4ge1xuICAgICAgICBjb25zdCBwcmVmZXJyZWRDb3VudHJ5ID0gdGhpcy5hbGxDb3VudHJpZXMuZmlsdGVyKChjKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGMuaXNvMiA9PT0gaXNvMjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5wcmVmZXJyZWRDb3VudHJpZXNJbkRyb3BEb3duLnB1c2gocHJlZmVycmVkQ291bnRyeVswXSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBzZWxlY3RlZENvdW50cnkuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVNlbGVjdGVkQ291bnRyeSgpIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50cnlJU08pIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudHJ5ID0gdGhpcy5hbGxDb3VudHJpZXMuZmluZCgoYykgPT4ge1xuICAgICAgICByZXR1cm4gYy5pc28yLnRvTG93ZXJDYXNlKCkgPT09IHRoaXMuc2VsZWN0ZWRDb3VudHJ5SVNPLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnRyeSkge1xuICAgICAgICBpZiAodGhpcy5waG9uZU51bWJlcikge1xuICAgICAgICAgIHRoaXMub25QaG9uZU51bWJlckNoYW5nZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlYXNvbjogYXZvaWQgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU0MzU4MTMzLzE2MTc1OTBcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLW51bGwta2V5d29yZFxuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICB0aGlzLnByb3BhZ2F0ZUNoYW5nZShudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cIml0aSBpdGktLWFsbG93LWRyb3Bkb3duXCIgW25nQ2xhc3NdPVwic2VwYXJhdGVEaWFsQ29kZUNsYXNzXCI+XG4gIDxkaXZcbiAgICBjbGFzcz1cIml0aV9fZmxhZy1jb250YWluZXJcIlxuICAgIGRyb3Bkb3duXG4gICAgW25nQ2xhc3NdPVwieyBkaXNhYmxlZDogZGlzYWJsZWQgfVwiXG4gICAgW2lzRGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuICA+XG4gICAgPGRpdiBjbGFzcz1cIml0aV9fc2VsZWN0ZWQtZmxhZyBkcm9wZG93bi10b2dnbGVcIiBkcm9wZG93blRvZ2dsZT5cbiAgICAgIDxkaXYgY2xhc3M9XCJpdGlfX2ZsYWdcIiBbbmdDbGFzc109XCJzZWxlY3RlZENvdW50cnkuZmxhZ0NsYXNzIHx8ICcnXCI+PC9kaXY+XG4gICAgICA8ZGl2ICpuZ0lmPVwic2VwYXJhdGVEaWFsQ29kZVwiIGNsYXNzPVwic2VsZWN0ZWQtZGlhbC1jb2RlXCI+XG4gICAgICAgICt7eyBzZWxlY3RlZENvdW50cnkuZGlhbENvZGUgfX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cIml0aV9fYXJyb3dcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2ICpkcm9wZG93bk1lbnUgY2xhc3M9XCJkcm9wZG93bi1tZW51IGNvdW50cnktZHJvcGRvd25cIj5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3M9XCJzZWFyY2gtY29udGFpbmVyXCJcbiAgICAgICAgKm5nSWY9XCJzZWFyY2hDb3VudHJ5RmxhZyAmJiBzZWFyY2hDb3VudHJ5RmllbGRcIlxuICAgICAgPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICBpZD1cImNvdW50cnktc2VhcmNoLWJveFwiXG4gICAgICAgICAgWyhuZ01vZGVsKV09XCJjb3VudHJ5U2VhcmNoVGV4dFwiXG4gICAgICAgICAgKGtleXVwKT1cInNlYXJjaENvdW50cnkoKVwiXG4gICAgICAgICAgKGNsaWNrKT1cIiRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiXG4gICAgICAgICAgW3BsYWNlaG9sZGVyXT1cInNlYXJjaENvdW50cnlQbGFjZWhvbGRlclwiXG4gICAgICAgICAgYXV0b2ZvY3VzXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDx1bCBjbGFzcz1cIml0aV9fY291bnRyeS1saXN0XCIgI2NvdW50cnlMaXN0PlxuICAgICAgICA8bGlcbiAgICAgICAgICBjbGFzcz1cIml0aV9fY291bnRyeSBpdGlfX3ByZWZlcnJlZFwiXG4gICAgICAgICAgKm5nRm9yPVwibGV0IGNvdW50cnkgb2YgcHJlZmVycmVkQ291bnRyaWVzSW5Ecm9wRG93blwiXG4gICAgICAgICAgKGNsaWNrKT1cIm9uQ291bnRyeVNlbGVjdChjb3VudHJ5LCBmb2N1c2FibGUpXCJcbiAgICAgICAgICBbaWRdPVwiY291bnRyeS5odG1sSWQgKyAnLXByZWZlcnJlZCdcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIml0aV9fZmxhZy1ib3hcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGlfX2ZsYWdcIiBbbmdDbGFzc109XCJjb3VudHJ5LmZsYWdDbGFzc1wiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaXRpX19jb3VudHJ5LW5hbWVcIj57eyBjb3VudHJ5Lm5hbWUgfX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpdGlfX2RpYWwtY29kZVwiPit7eyBjb3VudHJ5LmRpYWxDb2RlIH19PC9zcGFuPlxuICAgICAgICA8L2xpPlxuICAgICAgICA8bGlcbiAgICAgICAgICBjbGFzcz1cIml0aV9fZGl2aWRlclwiXG4gICAgICAgICAgKm5nSWY9XCJwcmVmZXJyZWRDb3VudHJpZXNJbkRyb3BEb3duPy5sZW5ndGhcIlxuICAgICAgICA+PC9saT5cbiAgICAgICAgPGxpXG4gICAgICAgICAgY2xhc3M9XCJpdGlfX2NvdW50cnkgaXRpX19zdGFuZGFyZFwiXG4gICAgICAgICAgKm5nRm9yPVwibGV0IGNvdW50cnkgb2YgYWxsQ291bnRyaWVzXCJcbiAgICAgICAgICAoY2xpY2spPVwib25Db3VudHJ5U2VsZWN0KGNvdW50cnksIGZvY3VzYWJsZSlcIlxuICAgICAgICAgIFtpZF09XCJjb3VudHJ5Lmh0bWxJZFwiXG4gICAgICAgID5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRpX19mbGFnLWJveFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIml0aV9fZmxhZ1wiIFtuZ0NsYXNzXT1cImNvdW50cnkuZmxhZ0NsYXNzXCI+PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJpdGlfX2NvdW50cnktbmFtZVwiPnt7IGNvdW50cnkubmFtZSB9fTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cIml0aV9fZGlhbC1jb2RlXCI+K3t7IGNvdW50cnkuZGlhbENvZGUgfX08L3NwYW4+XG4gICAgICAgIDwvbGk+XG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGlucHV0XG4gICAgdHlwZT1cInRlbFwiXG4gICAgW2lkXT1cImlucHV0SWRcIlxuICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgW25nQ2xhc3NdPVwiY3NzQ2xhc3NcIlxuICAgIChibHVyKT1cIm9uVG91Y2hlZCgpXCJcbiAgICAoa2V5cHJlc3MpPVwib25JbnB1dEtleVByZXNzKCRldmVudClcIlxuICAgIFsobmdNb2RlbCldPVwicGhvbmVOdW1iZXJcIlxuICAgIChuZ01vZGVsQ2hhbmdlKT1cIm9uUGhvbmVOdW1iZXJDaGFuZ2UoKVwiXG4gICAgW2Rpc2FibGVkXT1cImRpc2FibGVkXCJcbiAgICBbcGxhY2Vob2xkZXJdPVwicmVzb2x2ZVBsYWNlaG9sZGVyKClcIlxuICAgIFthdHRyLm1heExlbmd0aF09XCJtYXhMZW5ndGhcIlxuICAgIFthdHRyLnZhbGlkYXRpb25dPVwicGhvbmVWYWxpZGF0aW9uXCJcbiAgICAjZm9jdXNhYmxlXG4gIC8+XG48L2Rpdj5cbiJdfQ==