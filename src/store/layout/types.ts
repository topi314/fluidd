export interface LayoutState {
  layouts: Layouts;
}

/**
 * As single layout. Should have at least one container.
 * Configuration id's should not be duplicated across containers.
**/
export interface Layouts {
  [index: string]: LayoutContainer;
}

/** Containers, each of which is an array of configurations. */
export interface LayoutContainer {
  [index: string]: LayoutConfig[];
}

/** Configuration of a layout item */
export interface LayoutConfig {
  id: string;
  enabled: boolean;
  collapsed: boolean;
  layout?: string;
  container?: string;
  /**
   * Component name when `id` is an instance id.
   * Absent on factory cards, where `id` is the component name.
   */
  type?: string;
}

/** A camera tile pinned to one webcam, or to every enabled webcam. */
export interface CameraCardConfig extends LayoutConfig {
  type: 'camera-card';
  /** A webcam uid, or `'all'` for every enabled webcam. */
  cameraUid: string;
}

export const IFRAME_CARD_MIN_HEIGHT = 120
export const IFRAME_CARD_DEFAULT_HEIGHT = 360

/** A tile that embeds an external page. */
export interface IframeCardConfig extends LayoutConfig {
  type: 'iframe-card';
  url: string;
  title: string;
  height: number;
}

export const isCameraCardConfig = (card: LayoutConfig): card is CameraCardConfig => (
  card.type === 'camera-card' &&
  'cameraUid' in card &&
  typeof card.cameraUid === 'string'
)

export const isIframeCardConfig = (card: LayoutConfig): card is IframeCardConfig => (
  card.type === 'iframe-card' &&
  'url' in card && typeof card.url === 'string' &&
  'title' in card && typeof card.title === 'string' &&
  'height' in card && typeof card.height === 'number'
)
