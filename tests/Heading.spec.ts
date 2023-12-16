import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { EHeading, useRender } from '../src'

describe('render', () => {
  it('renders the <Heading> component', async () => {
    const component = h(
      EHeading,
      {
        mx: 4,
        as: 'h2',
      },
      {
        default: () => 'Lorem ipsum',
      },
    )

    const actualOutput = await useRender(component)

    expect(actualOutput.html).toMatchInlineSnapshot(
      '"<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><h2 data-id="__vue-email-heading" style="margin-left:4px;margin-right:4px;">Lorem ipsum</h2>"',
    )
  })
})
