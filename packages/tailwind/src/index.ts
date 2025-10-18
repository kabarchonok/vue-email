import { h, PropType, defineComponent } from "vue";

import { walkVNodeTree } from './utils/vnode'
import { getTailwindStyles } from "./utils/tailwindcss";
import { TailwindConfig } from "./utils";

export const pixelBasedPreset: TailwindConfig = {
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '36px' }],
        '5xl': ['48px', { lineHeight: '1' }],
        '6xl': ['60px', { lineHeight: '1' }],
        '7xl': ['72px', { lineHeight: '1' }],
        '8xl': ['96px', { lineHeight: '1' }],
        '9xl': ['144px', { lineHeight: '1' }],
      },
      spacing: {
        px: '1px',
        0: '0',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
      },
    }
  }
};

export const Tailwind: ReturnType<typeof defineComponent> = defineComponent({
  name: 'Tailwind',
  props: {
    config: {
      type: Object as PropType<TailwindConfig>,
      default: () => ({}),
      required: false,
    },
  },

  async setup(props, { slots }) {
    if (!slots.default) {
      throw new Error('Tailwind component must have a default slot')
    }

    const defaultSlot = slots.default()

    const transformed = await walkVNodeTree(defaultSlot, async (vNode) => {
      const vNodeClass = vNode.props?.class || ''
      const parsedCSSRules = await getTailwindStyles(vNodeClass, props.config);

      return {
        extraProps: { style: parsedCSSRules.styles },
        extraClasses: parsedCSSRules.classNames
      }
    })

    return () => {
      return h('tailwind-clean-component', {}, transformed)
    }
  },
})
