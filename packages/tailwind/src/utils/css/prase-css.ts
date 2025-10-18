/**
 * Удаляет все CSS комментарии из строки
 *
 * @example
 * removeCSSComments('/* comment *\/ .class { color: red; }') // ' .class { color: red; }'
 * removeCSSComments('/*! tailwindcss v4 *\/ body { margin: 0; }') // ' body { margin: 0; }'
 */
export function removeCSSComments(css: string): string {
  return css.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
}

/**
 * Парсит CSS строку и извлекает все CSS правила (селектор + содержимое)
 *
 * @example
 * const css = '.sm\\:w-50 { width: 50px; }'
 * getCSSRules(css) // [{ selector: '.sm\\:w-50', content: ' width: 50px; ' }]
 */
export function getCSSRules(css: string): Array<{ selector: string; content: string }> {
  // Сначала удаляем все комментарии
  const cleanCSS = removeCSSComments(css)
  const ruleRegex = /([^{]+)\s*\{([^{}]*(?:\{[^{}]*}[^{}]*)*)}/g
  const rules: Array<{ selector: string; content: string }> = []

  let match: RegExpExecArray | null
  while ((match = ruleRegex.exec(cleanCSS)) !== null) {
    rules.push({
      selector: match[1].trim(),
      content: match[2]
    })
  }

  return rules
}

/**
 * Убирает экранирование из CSS селектора для использования в HTML
 *
 * @example
 * unescapeSelector('.sm\\:w-50') // '.sm:w-50' (убран слеш)
 * unescapeSelector('.md\\:w-100') // '.md:w-100'
 * unescapeSelector('.w-1\\/2') // '.w-1/2'
 */
export function unescapeSelector(selector: string): string {
  return selector.replace(/\\(.)/g, '$1')
}

/**
 * @example
 * splitSelectors('.sm\\:w-50, .md\\:w-100') // ['.sm\\:w-50', '.md\\:w-100']
 * splitSelectors(':root, :host') // [':root', ':host']
 * splitSelectors('.single-class') // ['.single-class']
 */
export function splitSelectors(selector: string): string[] {
  return selector.split(/\s*,\s*/).map(s => s.trim()).filter(s => s.length > 0)
}

/**
 * Извлекает имя класса из CSS селектора для использования в HTML
 *
 * Regex объяснение: /^\.(.+)$/
 * - ^ - начало строки
 * - \. - точка (экранирована, так как точка - спецсимвол в regex)
 * - (.+) - захватывает один или более символов (имя класса с экранированием)
 * - $ - конец строки
 *
 * Работа:
 * 1. Проверяет, что селектор начинается с точки (class selector)
 * 2. Извлекает имя класса без точки
 * 3. Убирает экранирование через unescapeSelector для использования в HTML
 *
 * @example
 * extractClassName('.sm\\:w-50') // 'sm:w-50' (для HTML)
 * extractClassName('.md\\:w-100') // 'md:w-100'
 * extractClassName('.hover\\:bg-red') // 'hover:bg-red'
 * extractClassName('.w-1\\/2') // 'w-1/2'
 * extractClassName(':root') // null (не класс)
 */
export function extractClassName(selector: string): string | null {
  const match = selector.match(/^\.(.+)$/)
  if (!match) {
    return null
  }
  return unescapeSelector(match[1])
}

/**
 * Извлекает все @media блоки из CSS содержимого
 *
 * Regex объяснение: /@media\s*([^{]+)\s*\{([^}]+)\}/g
 * - @media - ключевое слово
 * - \s* - пропускаем пробелы
 * - ([^{]+) - захватываем условие media (например, "(width >= 40rem)")
 * - \s*\{ - пропускаем пробелы и находим открывающую скобку
 * - ([^}]+) - захватываем содержимое media блока (CSS свойства)
 * - \} - закрывающая скобка
 * - /g - глобальный поиск
 *
 * @example
 * const content = '@media (width >= 40rem) { width: 50px; }'
 * extractMediaQueries(content) // [{ condition: '(width >= 40rem)', styles: ' width: 50px; ' }]
 */
export function extractMediaQueries(content: string): Array<{ condition: string; styles: string }> {
  const mediaRegex = /@media\s*([^{]+)\s*\{([^}]+)}/g
  const mediaQueries: Array<{ condition: string; styles: string }> = []

  let match: RegExpExecArray | null
  while ((match = mediaRegex.exec(content)) !== null) {
    mediaQueries.push({
      condition: match[1].trim(),
      styles: match[2]
    })
  }

  return mediaQueries
}

/**
 * Извлекает обычные CSS свойства (не @media) из содержимого
 *
 * Regex объяснение: /@media\s*[^{]+\s*\{[^}]+\}/g
 * - Находит и удаляет все @media блоки целиком
 * - Оставшийся текст - это обычные CSS свойства
 *
 * @example
 * const content = 'color: red; @media (min-width: 768px) { width: 100%; } padding: 10px;'
 * extractDirectStyles(content) // 'color: red;  padding: 10px;'
 */
export function extractDirectStyles(content: string): string {
  // Удаляем все @media блоки
  return content.replace(/@media\s*[^{]+\s*\{[^}]+}/g, '').trim()
}

/**
 * Парсит CSS свойства в объект
 *
 * Regex объяснение: /([^:;\s]+)\s*:\s*([^;]+);?/g
 * - ([^:;\s]+) - имя свойства (символы до двоеточия, без пробелов и точек с запятой)
 * - \s*:\s* - двоеточие с опциональными пробелами
 * - ([^;]+) - значение свойства (все до точки с запятой)
 * - ;? - опциональная точка с запятой
 * - /g - глобальный поиск
 *
 * @example
 * parseStyles('width: 100px; color: red')
 * // { width: '100px', color: 'red' }
 */
export function parseStyles(styles: string): Record<string, string> {
  const propertyRegex = /([^:;\s]+)\s*:\s*([^;]+);?/g
  const result: Record<string, string> = {}

  let match: RegExpExecArray | null
  while ((match = propertyRegex.exec(styles)) !== null) {
    const property = match[1].trim()
    const value = match[2].trim()
    if (property && value) {
      result[property] = value
    }
  }

  return result
}

/**
 * Полный парсинг CSS правила с поддержкой множественных селекторов
 *
 * @example
 * const css = '.sm\\:w-50, .md\\:w-100 { @media (width >= 40rem) { width: 50px; } }'
 * parseCSSRule(css)
 * // {
 * //   classNames: ['sm:w-50', 'md:w-100'], // имена классов для HTML
 * //   selector: '.sm:w-50, .md:w-100',
 * //   escapedSelector: '.sm\\:w-50, .md\\:w-100',
 * //   directStyles: {},
 * //   mediaQueries: [
 * //     { condition: '(width >= 40rem)', styles: { width: '50px' } }
 * //   ]
 * // }
 *
 * @example
 * const css = ':root, :host { --spacing: 0.25rem; }'
 * parseCSSRule(css)
 * // {
 * //   classNames: [], // пустой массив для non-class селекторов
 * //   selector: ':root, :host',
 * //   escapedSelector: ':root, :host',
 * //   directStyles: { '--spacing': '0.25rem' },
 * //   mediaQueries: []
 * // }
 */
export function parseCSSRules(ruleText: string): ParsedCSSRule[] {
  const rules = getCSSRules(ruleText)

  return rules.map(rule => {
    const directStylesText = extractDirectStyles(rule.content)
    const mediaQueries = extractMediaQueries(rule.content)

    // Разделяем селекторы по запятым и извлекаем classNames
    const selectors = splitSelectors(rule.selector)
    const classNames = selectors.map(sel => extractClassName(sel)).filter((cn): cn is string => cn !== null)

    return {
      classNames,
      selector: unescapeSelector(rule.selector),
      escapedSelector: rule.selector,
      directStyles: parseStyles(directStylesText),
      mediaQueries: mediaQueries.map(mq => ({
        condition: mq.condition,
        styles: parseStyles(mq.styles)
      }))
    }
  })
}

export interface ParsedCSSRule {
    classNames: string[],
    selector: string,
    escapedSelector: string,
    directStyles: Record<string, string>,
    mediaQueries: {
      condition: string,
      styles: Record<string, string>
    }[]
}


const test =
  "/*! tailwindcss v4.1.14 | MIT License | https://tailwindcss.com */\n" +
  ".w-\\[150px\\]{width:150px}.sm\\:w-50{@media (width>=40rem){width:calc(var(--spacing)*50)}}.md\\:w-100{@media (width>=48rem){width:calc(var(--spacing)*100)}}:root,:host{--spacing:.25rem}";
const parsed = parseCSSRules(test)
console.log(JSON.stringify(parsed, null, 2));
