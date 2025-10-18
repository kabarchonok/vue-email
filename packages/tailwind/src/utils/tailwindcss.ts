import dedent from "dedent";
import { compile } from "tailwindcss";
import { transform } from 'lightningcss';
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { TailwindConfig } from "./index";
import { parseCSSRules } from "./css/prase-css";

const css = dedent

export interface TailwindCompilationResult {
  styles: Record<string, string>;
  classNames: string[];
}

type TailwindBuildFunction = (classes: string[]) => string;

async function initializeTailwindCompiler(config: TailwindConfig): Promise<TailwindBuildFunction> {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  try {
    // Only load the utilities' layer to avoid base reset styles
    const { build } = await compile(css`
        @import "tailwindcss/utilities";
        @import "tailwindcss/theme";
        
        @config "./config";
      `, {
      loadStylesheet: async (id: string, base: string) => {
        if (['tailwindcss/utilities', 'tailwindcss/theme'].includes(id)) {
          const tailwindUtilitiesPath = resolve(__dirname, `../../node_modules/${id}.css`)

          return {
            base,
            path: `virtual:${id}`,
            content: await readFile(tailwindUtilitiesPath, "utf-8"),
          };
        }
        throw new Error(`Unknown stylesheet: ${id}`)
      },

      loadModule: async () => ({
        path: './config.js',
        module: config,
        base: '/root',
      }),
    });

    return build;
  } catch (error) {
    throw new Error(`[tailwind] Failed to initialize compiler: ${error}`);
  }
}

async function compileClasses(classes: string[], config: TailwindConfig): Promise<string> {
  if (classes.length === 0) {
    return '';
  }

  try {
    const build = await initializeTailwindCompiler(config);
    const compiledCSS = build(classes);

    const minified = transform({
      filename: 'tailwind.css',
      minify: true,
      code: Buffer.from(compiledCSS)
    });

    return minified.code.toString();
  } catch (error) {
    throw new Error(`Failed to compile Tailwind classes: ${error}`);
  }
}

export async function getTailwindStyles(classes: string, config: TailwindConfig): Promise<TailwindCompilationResult> {
  const uniqueClasses = [...new Set(classes.split(' '))];
  const compiledCSS = await compileClasses(uniqueClasses, config);
  const parsedCSSRules = parseCSSRules(compiledCSS)

  const { styles, classNames } = parsedCSSRules.reduce((acc, item) => {
    if (!item.classNames || item.classNames.length === 0) {
      return acc
    }

    // TODO: add extract @media rules to Head
    if (item.mediaQueries.length) {
      return  acc
    }

    acc.classNames.push(...item.classNames)
    Object.assign(acc.styles, item.directStyles)

    return acc
  }, { styles: {}, classNames: [] } as TailwindCompilationResult)

  return { styles, classNames }
}
