/**
 * Accept only resources bundled with this application or assets the user
 * explicitly uploaded into local app state. Imported arbitrary URLs are not
 * allowed to trigger third-party image requests.
 */
export const isLocalImageSource = (
  source: string | null | undefined,
): source is string =>
  Boolean(
    source &&
      ((source.startsWith('/') && !source.startsWith('//')) ||
        /^data:image\/(?:png|jpeg|jpg|gif|webp|bmp|avif);base64,/i.test(source)),
  );
