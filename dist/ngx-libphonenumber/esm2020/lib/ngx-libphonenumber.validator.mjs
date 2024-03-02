import * as lpn from 'google-libphonenumber';
/*
We use "control: any" instead of "control: FormControl" to silence:
"Property 'nativeElement' does not exist on type 'FormControl'".
This happens because I've expanded control with nativeElement via
'NativeElementInjectorDirective' to get an access to the element.
More about this approach and reasons for this:
https://github.com/angular/angular/issues/18025
https://stackoverflow.com/a/54075119/1617590
*/
export const phoneNumberValidator = (control) => {
    if (!control.value) {
        return;
    }
    // Find <input> inside injected nativeElement and get its "id".
    const el = control.nativeElement;
    const inputBox = el
        ? el.querySelector('input[type="tel"]')
        : undefined;
    if (inputBox) {
        const id = inputBox.id;
        const isCheckValidation = inputBox.getAttribute('validation');
        if (isCheckValidation === 'true') {
            const isRequired = control.errors && control.errors.required === true;
            const error = { validatePhoneNumber: { valid: false } };
            inputBox.setCustomValidity('Invalid field.');
            let number;
            try {
                number = lpn.PhoneNumberUtil.getInstance().parse(control.value.number, control.value.countryCode);
            }
            catch (e) {
                if (isRequired) {
                    return error;
                }
                else {
                    inputBox.setCustomValidity('');
                }
            }
            if (control.value) {
                // @ts-ignore
                if (!number) {
                    return error;
                }
                else {
                    if (!lpn.PhoneNumberUtil.getInstance().isValidNumberForRegion(number, control.value.countryCode)) {
                        return error;
                    }
                    else {
                        inputBox.setCustomValidity('');
                    }
                }
            }
        }
        else if (isCheckValidation === 'false') {
            inputBox.setCustomValidity('');
            control.clearValidators();
        }
    }
    return;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWxpYnBob25lbnVtYmVyLnZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1saWJwaG9uZW51bWJlci9zcmMvbGliL25neC1saWJwaG9uZW51bWJlci52YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQztBQUU3Qzs7Ozs7Ozs7RUFRRTtBQUNGLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsT0FBWSxFQUFFLEVBQUU7SUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDbEIsT0FBTztLQUNSO0lBQ0QsK0RBQStEO0lBQy9ELE1BQU0sRUFBRSxHQUFnQixPQUFPLENBQUMsYUFBNEIsQ0FBQztJQUM3RCxNQUFNLFFBQVEsR0FBMkIsRUFBRTtRQUN6QyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztRQUN2QyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2QsSUFBSSxRQUFRLEVBQUU7UUFDWixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5RCxJQUFJLGlCQUFpQixLQUFLLE1BQU0sRUFBRTtZQUNoQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQztZQUN0RSxNQUFNLEtBQUssR0FBRyxFQUFFLG1CQUFtQixFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFFeEQsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFN0MsSUFBSSxNQUF1QixDQUFDO1lBRTVCLElBQUk7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUM5QyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzFCLENBQUM7YUFDSDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLElBQUksVUFBVSxFQUFFO29CQUNkLE9BQU8sS0FBSyxDQUFDO2lCQUNkO3FCQUFNO29CQUNMLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDaEM7YUFDRjtZQUVELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDakIsYUFBYTtnQkFDYixJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNYLE9BQU8sS0FBSyxDQUFDO2lCQUNkO3FCQUFNO29CQUNMLElBQ0UsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLHNCQUFzQixDQUN2RCxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzFCLEVBQ0Q7d0JBQ0EsT0FBTyxLQUFLLENBQUM7cUJBQ2Q7eUJBQU07d0JBQ0wsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNoQztpQkFDRjthQUNGO1NBQ0Y7YUFBTSxJQUFJLGlCQUFpQixLQUFLLE9BQU8sRUFBRTtZQUN4QyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFL0IsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQzNCO0tBQ0Y7SUFDRCxPQUFPO0FBQ1QsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbHBuIGZyb20gJ2dvb2dsZS1saWJwaG9uZW51bWJlcic7XG5cbi8qXG5XZSB1c2UgXCJjb250cm9sOiBhbnlcIiBpbnN0ZWFkIG9mIFwiY29udHJvbDogRm9ybUNvbnRyb2xcIiB0byBzaWxlbmNlOlxuXCJQcm9wZXJ0eSAnbmF0aXZlRWxlbWVudCcgZG9lcyBub3QgZXhpc3Qgb24gdHlwZSAnRm9ybUNvbnRyb2wnXCIuXG5UaGlzIGhhcHBlbnMgYmVjYXVzZSBJJ3ZlIGV4cGFuZGVkIGNvbnRyb2wgd2l0aCBuYXRpdmVFbGVtZW50IHZpYVxuJ05hdGl2ZUVsZW1lbnRJbmplY3RvckRpcmVjdGl2ZScgdG8gZ2V0IGFuIGFjY2VzcyB0byB0aGUgZWxlbWVudC5cbk1vcmUgYWJvdXQgdGhpcyBhcHByb2FjaCBhbmQgcmVhc29ucyBmb3IgdGhpczpcbmh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE4MDI1XG5odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQwNzUxMTkvMTYxNzU5MFxuKi9cbmV4cG9ydCBjb25zdCBwaG9uZU51bWJlclZhbGlkYXRvciA9IChjb250cm9sOiBhbnkpID0+IHtcbiAgaWYgKCFjb250cm9sLnZhbHVlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIEZpbmQgPGlucHV0PiBpbnNpZGUgaW5qZWN0ZWQgbmF0aXZlRWxlbWVudCBhbmQgZ2V0IGl0cyBcImlkXCIuXG4gIGNvbnN0IGVsOiBIVE1MRWxlbWVudCA9IGNvbnRyb2wubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgY29uc3QgaW5wdXRCb3g6IEhUTUxJbnB1dEVsZW1lbnQgfCBhbnkgPSBlbFxuICAgID8gZWwucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1cInRlbFwiXScpXG4gICAgOiB1bmRlZmluZWQ7XG4gIGlmIChpbnB1dEJveCkge1xuICAgIGNvbnN0IGlkID0gaW5wdXRCb3guaWQ7XG4gICAgY29uc3QgaXNDaGVja1ZhbGlkYXRpb24gPSBpbnB1dEJveC5nZXRBdHRyaWJ1dGUoJ3ZhbGlkYXRpb24nKTtcbiAgICBpZiAoaXNDaGVja1ZhbGlkYXRpb24gPT09ICd0cnVlJykge1xuICAgICAgY29uc3QgaXNSZXF1aXJlZCA9IGNvbnRyb2wuZXJyb3JzICYmIGNvbnRyb2wuZXJyb3JzLnJlcXVpcmVkID09PSB0cnVlO1xuICAgICAgY29uc3QgZXJyb3IgPSB7IHZhbGlkYXRlUGhvbmVOdW1iZXI6IHsgdmFsaWQ6IGZhbHNlIH0gfTtcblxuICAgICAgaW5wdXRCb3guc2V0Q3VzdG9tVmFsaWRpdHkoJ0ludmFsaWQgZmllbGQuJyk7XG5cbiAgICAgIGxldCBudW1iZXI6IGxwbi5QaG9uZU51bWJlcjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbnVtYmVyID0gbHBuLlBob25lTnVtYmVyVXRpbC5nZXRJbnN0YW5jZSgpLnBhcnNlKFxuICAgICAgICAgIGNvbnRyb2wudmFsdWUubnVtYmVyLFxuICAgICAgICAgIGNvbnRyb2wudmFsdWUuY291bnRyeUNvZGVcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGlzUmVxdWlyZWQpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5wdXRCb3guc2V0Q3VzdG9tVmFsaWRpdHkoJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb250cm9sLnZhbHVlKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKCFudW1iZXIpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWxwbi5QaG9uZU51bWJlclV0aWwuZ2V0SW5zdGFuY2UoKS5pc1ZhbGlkTnVtYmVyRm9yUmVnaW9uKFxuICAgICAgICAgICAgICBudW1iZXIsXG4gICAgICAgICAgICAgIGNvbnRyb2wudmFsdWUuY291bnRyeUNvZGVcbiAgICAgICAgICAgIClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5wdXRCb3guc2V0Q3VzdG9tVmFsaWRpdHkoJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNDaGVja1ZhbGlkYXRpb24gPT09ICdmYWxzZScpIHtcbiAgICAgIGlucHV0Qm94LnNldEN1c3RvbVZhbGlkaXR5KCcnKTtcblxuICAgICAgY29udHJvbC5jbGVhclZhbGlkYXRvcnMoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuO1xufTtcbiJdfQ==