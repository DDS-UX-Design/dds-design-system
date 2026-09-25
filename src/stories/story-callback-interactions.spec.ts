import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
// @ts-expect-error Storybook exposes this runtime entry point without type declarations.
import { applyDecorators } from '@storybook/angular/client/config';
import { AlertComponent } from '../app/components/alert/alert.component';
import { ToastComponent } from '../app/components/toast/toast.component';
import { TextareaComponent } from '../app/components/textarea/textarea.component';
import { SearchComponent } from '../app/components/search/search.component';
import { RadioComponent } from '../app/components/radio/radio.component';
import { SelectComponent } from '../app/components/select/select.component';
import selectMeta, { SelectOptionInteraction, MultiSelect } from './select.stories';
import { SidebarNavComponent } from '../app/components/sidebar-nav/sidebar-nav.component';
import sidebarMeta, { ExpandAndSelect } from './sidebar-nav.stories';
import { TextInputComponent } from '../app/components/text-input/text-input.component';
import textInputMeta, { Entry } from './text-input.stories';
import { TopBarNavComponent } from '../app/components/top-bar-nav/top-bar-nav.component';
import topBarMeta, { AccountMenuInteraction } from './top-bar-nav.stories';
import { RadioGroupComponent } from '../app/components/radio-group/radio-group.component';
import radioGroupMeta, { ChangeSelection } from './radio-group.stories';
import { PasswordInputComponent } from '../app/components/password-input/password-input.component';
import passwordMeta, { VisibilityToggle } from './password-input.stories';
import { OtpInputComponent } from '../app/components/otp-input/otp-input.component';
import otpMeta, { PasteCompleteCode } from './otp-input.stories';
import { DateInputComponent } from '../app/components/date-input/date-input.component';
import dateMeta, { Entry as DateEntry } from './date-input.stories';
import { CheckboxComponent } from '../app/components/checkbox/checkbox.component';
import checkboxMeta, { Toggle } from './checkbox.stories';
import { CheckboxGroupComponent } from '../app/components/checkbox-group/checkbox-group.component';
import checkboxGroupMeta, { ToggleOptions } from './checkbox-group.stories';
import radioMeta, { Select } from './radio.stories';
import searchMeta, { SubmitQuery, KeyboardSelection } from './search.stories';
import textareaMeta, { EnterResponse } from './textarea.stories';
import alertMeta, { DismissInteraction as alertStory } from './alert.stories';
import toastMeta, { DismissInteraction as toastStory } from './toast.stories';

@Component({
  imports: [
    AlertComponent,
    ToastComponent,
    TextareaComponent,
    SearchComponent,
    RadioComponent,
    CheckboxComponent,
    CheckboxGroupComponent,
    RadioGroupComponent,
    SelectComponent,
    SidebarNavComponent,
    TextInputComponent,
    DateInputComponent,
    PasswordInputComponent,
    OtpInputComponent,
    TopBarNavComponent,
  ],
  template:
    '<dds-alert /><dds-toast /><dds-textarea /><dds-search /><dds-radio /><dds-checkbox /><dds-checkbox-group /><dds-radio-group /><dds-select /><dds-sidebar-nav /><dds-text-input /><dds-date-input /><dds-password-input /><dds-otp-input /><dds-top-bar-nav />',
})
class StoryHost {}

describe('Story interactions', () => {
  for (const [label, meta, story, callback] of [
    ['Alert', alertMeta, alertStory, 'onDismiss'],
    ['Toast', toastMeta, toastStory, 'onDismiss'],
    ['Textarea', textareaMeta, EnterResponse, 'onValueChange'],
    ['Radio', radioMeta, Select, 'onSelected'],
    ['Checkbox toggle', checkboxMeta, Toggle, 'onValueChange'],
    ['Checkbox Group toggle options', checkboxGroupMeta, ToggleOptions, 'onSelectedValuesChange'],
    ['Radio Group change selection', radioGroupMeta, ChangeSelection, 'onSelectedValueChange'],
    ['Text Input entry', textInputMeta, Entry, null],
    ['Date Input entry', dateMeta, DateEntry, null],
    ['Password visibility toggle', passwordMeta, VisibilityToggle, null],
    ['OTP paste complete code', otpMeta, PasteCompleteCode, 'onComplete'],
    ['Top Bar account menu', topBarMeta, AccountMenuInteraction, 'onMenuItemSelect'],
    ['Sidebar expand and select', sidebarMeta, ExpandAndSelect, 'onItemSelect'],
    ['Select option', selectMeta, SelectOptionInteraction, 'onValueChange'],
    ['Select multiple options', selectMeta, MultiSelect, 'onSelectedValuesChange'],
    ['Search submit', searchMeta, SubmitQuery, 'onSearch'],
    ['Search keyboard selection', searchMeta, KeyboardSelection, 'onSuggestionSelected'],
  ] as const) {
    it(`${label} runs through Angular story argument filtering`, async () => {
      const args = { ...meta.args, ...story.args } as any;
      if (callback) args[callback].mockClear();
      // Supply inferred controls for primitive inputs, as Storybook does before rendering.
      const argTypes = {
        ...Object.fromEntries(
          Object.entries(args)
            .filter(([, value]) => typeof value !== 'function')
            .map(([key]) => [key, { control: 'object' }]),
        ),
        ...meta.argTypes,
      };
      const context = { args, argTypes, component: meta.component } as any;
      const render = applyDecorators((ctx: any) => (meta.render as Function)(ctx.args), []);
      const rendered = render(context);
      if (callback) expect(rendered.props[callback]).toBe(args[callback]);
      TestBed.overrideComponent(StoryHost, { set: { template: rendered.template } });
      await TestBed.configureTestingModule({ imports: [StoryHost] }).compileComponents();
      const fixture = TestBed.createComponent(StoryHost);
      Object.assign(fixture.componentInstance, rendered.props);
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      const linkClicks: Event[] = [];
      fixture.nativeElement.addEventListener('click', (event: Event) => {
        if ((event.target as Element).closest('a[href]')) linkClicks.push(event);
      });
      try {
        await (story.play as Function)({ args, canvasElement: fixture.nativeElement });
        await fixture.whenStable();
        if (callback === 'onItemSelect') {
          expect(linkClicks).toHaveLength(1);
          expect(linkClicks[0].defaultPrevented).toBe(true);
        }
        if (callback === 'onDismiss') expect(args[callback]).toHaveBeenCalledTimes(1);
      } finally {
        fixture.nativeElement.remove();
      }
    });
  }
});
