import { describe, expect, it } from "vitest";
import { h } from "vue";
import { render } from "@vue-email/render";
import { Tailwind } from "./index";

describe("Tailwind", () => {
  describe("inline styles", () => {
    it("should render simple utility classes", async () => {
      const component = h(Tailwind, [
          h("div", { class: "flex flex-col flex-1" }),
        ],
      );

      const actualOutput = await render(component);
      expect(actualOutput).toMatchSnapshot();
    });

    it("should render arbitrary value classes", async () => {
      const component = h(Tailwind, [
        h("div", { class: "text-[#ccc] w-[100px]" }),
      ]);

      const actualOutput = await render(component);
      expect(actualOutput).toMatchSnapshot();
    });

    it('should render @media classes', async () => {
      const component = h(Tailwind, [
        h('div', { class: 'md:w-100 sm:w-50' })
      ])

      const actualOutput = await render(component);
      expect(actualOutput).toMatchSnapshot();
    })

    it('should render @media classes and inline other styles', async () => {
      const component = h(Tailwind, [
        h('div', { class: 'md:w-100 sm:w-50 w-[150px]' })
      ])

      const actualOutput = await render(component);
      expect(actualOutput).toMatchSnapshot();
    })
  });

  describe("tags render", () => {
    it("should render single tags correctly", async () => {
      const component = h(Tailwind, {}, [
        h("address", [
          "Best regards,",
          h("br"),
          "John Smith",
          h("br"),
          "john@example.com",
        ]),
      ]);

      const actualOutput = await render(component);
      expect(actualOutput).toMatchSnapshot();
    });
  });
});
