import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const families = {
  disclosure: ['collapsible-panel'],
  chart: ['chart'],
  navigation: [
    'nav-tab',
    'sidebar-nav',
    'top-bar-nav',
    'page-toolbar',
    'minimal-pagination',
    'numbered-pagination',
    'data-table',
    'kpi-card',
  ],
  feedback: ['alert', 'toast', 'status-badge'],
  entry: ['text-input', 'textarea', 'password-input', 'search', 'otp-input'],
  selection: [
    'checkbox',
    'checkbox-group',
    'radio',
    'radio-group',
    'select',
    'date-input',
    'toggle',
    'toggle-field',
  ],
};
const generated = readFileSync(
  new URL('../src/tokens/generated/figma.tokens.css', import.meta.url),
  'utf8',
);
const css = (name) =>
  readFileSync(
    new URL(`../src/app/components/${name}/${name}.component.css`, import.meta.url),
    'utf8',
  );
for (const [family, components] of Object.entries(families)) {
  test(`${family}: colour references use public generated semantic roles`, () => {
    for (const name of components) {
      const source = css(name);
      assert.doesNotMatch(
        source,
        /var\(--(?:(?:text|bg|border|icon|btn)-colour|colour-neutral|dds-primitive|grey-|blue-|red-|green-|yellow-|teal-)/,
        name,
      );
      assert.doesNotMatch(source, /#[\da-f]{3,8}\b|rgba?\(/i, name);
      for (const [, token] of source.matchAll(/var\((--color-[\w-]+)\)/g)) {
        assert.ok(generated.includes(`${token}:`), `${name}: unknown ${token}`);
      }
    }
  });
}

// jsdom does not resolve custom properties. Substitute distinct test-only colours
// for each role to check the real selector cascade, independent of token values.
// This is not rendered browser verification.
const roles = [...new Set([...generated.matchAll(/(--color-[\w-]+):/g)].map((m) => m[1]))];
const sentinel = (role) => `rgb(${roles.indexOf(role) + 1}, 0, 0)`;
const cascadeCss = (name) =>
  css(name).replace(/var\((--color-[\w-]+)\)/g, (_, role) => sentinel(role));
for (const [name, prefix, shape] of [
  ['text-input', 'dds-text-input', 'field'],
  ['textarea', 'dds-textarea', 'field'],
  ['password-input', 'dds-password-input', 'field'],
  ['otp-input', 'dds-otp', 'field'],
  ['select', 'dds-select', 'field'],
  ['date-input', 'dds-date-input', 'field'],
  ['checkbox', 'dds-checkbox', 'box'],
  ['radio', 'dds-radio', 'circle'],
]) {
  test(`${name}: disabled wins over validation/focus and uses a semantic surface`, () => {
    const invalid = ['checkbox', 'radio'].includes(name) ? 'invalid' : 'error';
    const dom = new JSDOM(
      `<style>${cascadeCss(name)}</style><div class="${prefix} ${prefix}--disabled ${prefix}--${invalid} ${prefix}--focused"><input class="${prefix}__native" checked disabled><span class="${prefix}__${shape} ${prefix}__field--active"></span></div>`,
    );
    const style = dom.window.getComputedStyle(dom.window.document.querySelector('span'));
    if (name === 'text-input') {
      assert.equal(style.boxShadow, `inset 0 0 0 1px ${sentinel('--color-border-strong')}`);
    } else if (name === 'textarea') {
      assert.equal(style.boxShadow, `inset 0 0 0 1px ${sentinel('--color-border-default')}`);
    } else {
      assert.equal(style.borderTopColor, sentinel('--color-border-default'));
    }
    assert.equal(style.backgroundColor, sentinel('--color-bg-subtle'));
    dom.window.close();
  });
}

test('validation copy and destructive focus retain their semantic roles', () => {
  const dom = new JSDOM(
    `<style>${css('text-input')}</style><p class="dds-text-input__message dds-text-input__message--error"></p>`,
  );
  assert.equal(
    dom.window.getComputedStyle(dom.window.document.querySelector('p')).color,
    'var(--color-feedback-error)',
  );
  for (const name of [
    'text-input',
    'textarea',
    'password-input',
    'otp-input',
    'checkbox',
    'radio',
    'select',
    'date-input',
  ]) {
    assert.ok(css(name).includes('var(--color-border-focus-danger)'), name);
  }
  dom.window.close();
});

for (const name of ['alert', 'toast']) {
  test(`${name}: each feedback tone uses its own surface, border and icon role`, () => {
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      const role = tone === 'danger' ? 'error' : tone;
      const dom = new JSDOM(
        `<style>${cascadeCss(name)}</style><div class="dds-${name} dds-${name}--${tone}"><span class="dds-${name}__status-icon"></span></div>`,
      );
      const element = dom.window.document.querySelector('div');
      assert.equal(
        dom.window.getComputedStyle(element).backgroundColor,
        sentinel(`--color-feedback-${role}-subtle`),
      );
      assert.equal(
        dom.window.getComputedStyle(element).borderLeftColor,
        sentinel(`--color-feedback-${role}`),
      );
      assert.equal(
        dom.window.getComputedStyle(element.firstChild).color,
        sentinel(`--color-feedback-${role}`),
      );
      dom.window.close();
    }
  });
}

test('disabled navigation beats active styling and disabled icons inherit disabled colour', () => {
  const dom = new JSDOM(
    `<style>${cascadeCss('sidebar-nav')} ${cascadeCss('numbered-pagination')}</style><a class="dds-sidebar-nav__parent dds-sidebar-nav__parent--active dds-sidebar-nav__parent--disabled" aria-disabled="true"><dds-icon></dds-icon></a><button disabled class="dds-numbered-pagination__item dds-numbered-pagination__item--active"></button>`,
  );
  assert.equal(
    dom.window.getComputedStyle(dom.window.document.querySelector('dds-icon')).color,
    sentinel('--color-text-disabled'),
  );
  // Use an isolated document for each stylesheet (jsdom caches pseudo matching).
  const pages = new JSDOM(
    `<style>${cascadeCss('numbered-pagination')}</style><button disabled class="dds-numbered-pagination__item dds-numbered-pagination__item--active"></button>`,
  );
  const button = pages.window.getComputedStyle(pages.window.document.querySelector('button'));
  assert.equal(button.color, sentinel('--color-text-disabled'));
  assert.equal(button.backgroundColor, sentinel('--color-bg-subtle'));
  pages.window.close();
  dom.window.close();
});

test('Chart canvas reads generated semantic names and contains no colour literal fallback', () => {
  const source = readFileSync(
    new URL('../src/app/components/chart/chart.component.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(source, /#[\da-f]{3,8}\b|--(?:chart-[1-6]|grey-|bg-colour|text-colour)/i);
  for (const [, role] of source.matchAll(/'(--color-[\w-]+)'/g))
    assert.ok(generated.includes(`${role}:`), role);
});

for (const [name, markup, selector] of [
  [
    'text-input',
    '<div class="dds-text-input--disabled"><p class="dds-text-input__message dds-text-input__message--error"></p></div>',
    'p',
  ],
  [
    'password-input',
    '<div class="dds-password-input--disabled"><p class="dds-password-input__error"></p></div>',
    'p',
  ],
  [
    'textarea',
    '<div class="dds-textarea--disabled"><span class="dds-textarea__count"></span></div>',
    'span',
  ],
  [
    'otp-input',
    '<div class="dds-otp--disabled"><p class="dds-otp__expiry"><strong></strong></p></div>',
    'strong',
  ],
  [
    'select',
    '<div class="dds-select--disabled"><p class="dds-select__supporting-text"></p></div>',
    'p',
  ],
]) {
  test(`${name}: disabled supporting content uses its documented role`, () => {
    const dom = new JSDOM(`<style>${cascadeCss(name)}</style>${markup}`);
    assert.equal(
      dom.window.getComputedStyle(dom.window.document.querySelector(selector)).color,
      sentinel(
        name === 'text-input'
          ? '--color-text-secondary'
          : name === 'textarea'
            ? '--color-text-muted'
            : '--color-text-disabled',
      ),
    );
    dom.window.close();
  });
}

test('Collapsible Panel anatomy follows the current surface, text, border and icon bindings', () => {
  const dom = new JSDOM(
    `<style>${cascadeCss('collapsible-panel')}</style><div class="dds-collapsible-panel"><button class="dds-collapsible-panel__header"><span class="dds-collapsible-panel__chevron"></span></button><div class="dds-collapsible-panel__body"></div></div>`,
  );
  const value = (selector, property) =>
    dom.window
      .getComputedStyle(dom.window.document.querySelector(selector))
      .getPropertyValue(property);
  assert.equal(
    value('.dds-collapsible-panel', 'background-color'),
    sentinel('--color-bg-elevated'),
  );
  assert.equal(
    value('.dds-collapsible-panel', 'border-top-color'),
    sentinel('--color-border-default'),
  );
  assert.equal(value('button', 'color'), sentinel('--color-text-primary'));
  assert.equal(value('.dds-collapsible-panel__body', 'color'), sentinel('--color-text-secondary'));
  assert.equal(
    value('.dds-collapsible-panel__chevron', 'background-color'),
    sentinel('--color-icon-default'),
  );
  dom.window.close();
});

test('Toggle disabled states preserve thumb position and override focus/hover colours', () => {
  for (const small of [false, true]) {
    const dom = new JSDOM(
      `<style>${cascadeCss('toggle')}</style><span class="dds-toggle dds-toggle--checked dds-toggle--disabled dds-toggle--focused dds-toggle--hover ${small ? 'dds-toggle--small' : ''}"><input class="dds-toggle__input" disabled><span class="dds-toggle__track"><span class="dds-toggle__thumb"></span></span></span>`,
    );
    const root = dom.window.getComputedStyle(dom.window.document.querySelector('.dds-toggle'));
    assert.equal(root.getPropertyValue('--toggle-bg'), sentinel('--color-bg-subtle'));
    assert.equal(root.getPropertyValue('--toggle-stroke'), sentinel('--color-border-default'));
    assert.equal(root.getPropertyValue('--toggle-thumb'), sentinel('--color-text-disabled'));
    const track = dom.window.getComputedStyle(
      dom.window.document.querySelector('.dds-toggle__track'),
    );
    assert.equal(track.boxShadow, '0 0 0 1px var(--toggle-stroke)');
    const thumb = dom.window.getComputedStyle(
      dom.window.document.querySelector('.dds-toggle__thumb'),
    );
    assert.equal(thumb.left, small ? '24px' : '28px');
    dom.window.close();
  }
});

test('Toggle native focus overrides hover preview with the semantic focus ring', () => {
  const dom = new JSDOM(
    `<style>${cascadeCss('toggle')}</style><span class="dds-toggle dds-toggle--checked dds-toggle--hover"><input class="dds-toggle__input"><span class="dds-toggle__track"></span></span>`,
  );
  dom.window.document.querySelector('input').focus();
  const track = dom.window.getComputedStyle(
    dom.window.document.querySelector('.dds-toggle__track'),
  );
  assert.equal(track.boxShadow, `0 0 0 3px ${sentinel('--color-border-focus')}`);
  dom.window.close();
});

test('Textarea disabled label, required marker and counter preserve their main-component roles', () => {
  for (const [className, role] of [
    ['dds-textarea__label', '--color-text-primary'],
    ['dds-textarea__required', '--color-feedback-error'],
    ['dds-textarea__count', '--color-text-muted'],
  ]) {
    const dom = new JSDOM(
      `<style>${cascadeCss('textarea')}</style><div class="dds-textarea dds-textarea--disabled"><span class="${className}"></span></div>`,
    );
    assert.equal(
      dom.window.getComputedStyle(dom.window.document.querySelector('span')).color,
      sentinel(role),
    );
    dom.window.close();
  }
});

test('Sidebar follows the current elevated-surface Figma bindings, including active icons', () => {
  // Isolate each lookup: jsdom caches pseudo-selector matches across ancestor style queries.
  const value = (selector, property) => {
    const dom = new JSDOM(
      `<style>${cascadeCss('sidebar-nav')}</style><aside class="dds-sidebar-nav"><header class="dds-sidebar-nav__header"></header><button class="dds-sidebar-nav__parent dds-sidebar-nav__parent--active"><dds-icon></dds-icon></button><a class="dds-sidebar-nav__child dds-sidebar-nav__child--active"></a></aside>`,
    );
    const result = dom.window
      .getComputedStyle(dom.window.document.querySelector(selector))
      .getPropertyValue(property);
    dom.window.close();
    return result;
  };
  assert.equal(value('aside', 'background-color'), sentinel('--color-bg-elevated'));
  assert.equal(value('aside', 'color'), sentinel('--color-text-primary'));
  assert.equal(value('header', 'border-bottom-color'), sentinel('--color-border-default'));
  assert.equal(value('button', 'background-color'), sentinel('--color-feedback-info-subtle'));
  assert.equal(value('dds-icon', 'color'), sentinel('--color-icon-default'));
  assert.equal(value('a', 'color'), sentinel('--color-interactive-default'));
});
