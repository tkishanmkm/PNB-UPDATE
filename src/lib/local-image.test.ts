import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isLocalImageSource } from './local-image';

describe('local image source policy', () => {
  it('accepts same-origin bundled asset paths', () => {
    assert.equal(isLocalImageSource('/pnb-splash/pnb-logo.png'), true);
    assert.equal(isLocalImageSource('/assets/icon.svg'), true);
  });

  it('accepts supported local raster data URLs', () => {
    assert.equal(isLocalImageSource('data:image/png;base64,AAAA'), true);
    assert.equal(isLocalImageSource('data:image/webp;base64,AAAA'), true);
  });

  it('rejects external, protocol-relative and executable URLs', () => {
    assert.equal(isLocalImageSource('https://example.com/avatar.png'), false);
    assert.equal(isLocalImageSource('//example.com/avatar.png'), false);
    assert.equal(isLocalImageSource('javascript:alert(1)'), false);
    assert.equal(isLocalImageSource('blob:https://example.com/id'), false);
  });

  it('does not accept imported SVG data URLs that could contain external references', () => {
    assert.equal(isLocalImageSource('data:image/svg+xml;base64,PHN2Zz4='), false);
  });

  it('rejects empty or missing values', () => {
    assert.equal(isLocalImageSource(''), false);
    assert.equal(isLocalImageSource(undefined), false);
    assert.equal(isLocalImageSource(null), false);
  });
});
