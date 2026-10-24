import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const families = {
  feedback: ['alert', 'toast', 'status-badge'],
  entry: ['text-input', 'textarea', 'password-input', 'search', 'otp-input'],
  selection: ['checkbox', 'checkbox-group', 'radio', 'radio-group', 'select', 'date-input'],
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
    assert.equal(style.borderTopColor, sentinel('--color-border-default'));
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
