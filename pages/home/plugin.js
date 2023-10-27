import { EditorProps } from "@grapesjs/react";
import { BlockProperties, Plugin } from "grapesjs";
import { Editor, Page } from "grapesjs";

import grapesjsPluginExport from "grapesjs-plugin-export";
import gjsTailwind from "grapesjs-tailwind";
import gjsBlockBasic from "grapesjs-blocks-basic";
import gjsPluginForm from "grapesjs-plugin-forms";
import gjsParserPostCss from "grapesjs-parser-postcss";
import gjsCustomCode from "grapesjs-custom-code";
import gjsNavbar from "grapesjs-navbar";

const PluginOptions = {
	block: {},
};

const PluginToLoad = {
	id: "",
	src: "",
	options: PluginOptions,
};

const sectionId = "section";
const prefixPage = "page://";
const containerId = "container";
const sectionClass = "gjs-section";
const containerClass = "gjs-container";
const blockIdColumn37 = "column3-7";

export const toSafeFilename = (value) =>
	value.replace(/[^a-z0-9.]/gi, "_").toLowerCase();

export const getPageSlug = (editor, page) => {
	const { Pages } = editor;
	const index = Pages.getAll().indexOf(page);
	const filename = index === 0 ? "index" : toSafeFilename(page.getName());
	return `${filename}.html`;
};

function debounce(func, wait, immediate) {
	let timeout;
	let args;
	let context;
	let timestamp;
	let result;
	const waitNum = undefined === wait ? 100 : wait;

	function later() {
		var last = Date.now() - timestamp;

		if (last < waitNum && last >= 0) {
			timeout = setTimeout(later, waitNum - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				context = args = null;
			}
		}
	}

	const debounced = function () {
		// @ts-ignore
		context = this;
		args = arguments;
		timestamp = Date.now();
		var callNow = immediate && !timeout;
		if (!timeout) timeout = setTimeout(later, waitNum);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};

	debounced.clear = function () {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	debounced.flush = function () {
		if (timeout) {
			result = func.apply(context, args);
			context = args = null;

			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
}

const toEditorType = (...ids) => {
	return ids.map((id) => `[data-gjs-type="${id}"]`).join(",");
};

const elHasTagName = (el, ...tags) => {
	return tags.indexOf(el?.tagName?.toUpperCase()) >= 0;
};

const elHasAttribute = (el, attrName) => {
	return !!el?.getAttribute?.(attrName);
};

const elHasClassName = (el, className) => {
	return el?.classList?.contains(className);
};

const getBlockIndex = (editor, blockId) => {
	const block = editor.Blocks.get(blockId);
	return block ? block.collection.indexOf(block) : -1;
};

const extendComponents = function (editor, opts = {}) {
	const { Components, Blocks } = editor;
    const wrapperModel = Components.getType('wrapper')?.model;
	const wrapperDefaults = wrapperModel.getDefaults();

	Components.addType("wrapper", {
		model: {
			defaults: {
				emptyState: {
					styleIn: "height: 100vh",
					styleOut: "padding: 0;",
				},
				stylable: [
					...wrapperDefaults.stylable,
					// For now, the whole Typography section is visible because we don't handle
					// properly each property visibility, so this might change in case that will
					// be fixed (we'll need to indicate all Typography properties in that case).
					"font-family",
				],
			},
		},
	});

	Components.addType("text", {
		model: {
			defaults: {
				highlightable: false,
				emptyState: {
					styleIn: "min-height: auto; font-size: inherit;",
				},
			},
		},
	});

	Components.addType("image", {
		model: {
			defaults: {
				traits: [
					"alt",
					{
						type: "checkbox",
						name: "loading",
						valueTrue: "lazy",
					},
				],
			},
		},
	});

	const linkClass = "gjs-link";
	const typeLink = Components.getType("link");
	if (!typeLink) {
		throw new Error("Link component not found");
	}
	const typyLinkModel = typeLink.model;
	Components.addType("link", {
		model: {
			defaults: {
				emptyState: true,
				attributes: { class: linkClass },
				traits: [
					"title",
					{
						type: "checkbox",
						name: "target",
						valueTrue: "_blank",
					},
					{
						type: "href",
						name: "href",
					},
				],
				styles: `
            .${linkClass} {
              vertical-align: top;
              max-width: 100%;
              display: inline-block;
              text-decoration: none;
              color: inherit;
            }
          `,
			},

			getAttrToHTML() {
				const attr =
					typyLinkModel.prototype.getAttrToHTML.apply(this) || {};
				const { href } = attr;

				if (href) {
					if (href.indexOf(prefixPage) === 0) {
						const pageId = href.replace(prefixPage, "");
						const page = editor.Pages.get(pageId);
						attr.href = page
							? `./${getPageSlug(editor, page)}`
							: "##";
					}
				}

				return attr;
			},
		},
	});

	Blocks.add(
		"link",
		{
			label: "Link",
			content: {
				type: "link",
				content: "Link",
				style: { color: "#d983a6", padding: "10px" },
			},
		},
		{ merge: true }
	);

	Components.addType("select", {
		model: {
			defaults: {
				attributes: { class: linkClass },
				styles: `
            .${linkClass} {
              vertical-align: top;
              max-width: 100%;
              display: inline-block;
              text-decoration: none;
              color: inherit;
            }
          `,
			},
		},
	});

	Components.addType("select", {
		model: {
			defaults: {
				traits: [
					{ name: "name" },
					{
						type: "checkbox",
						name: "required",
					},
					{
						name: "options",
						type: "stack",
						getValue({ component }) {
							return component.components().map((cmp) => ({
								id: cmp.getAttributes()["value"] || "",
								label: cmp.getInnerHTML(),
							}));
						},
						setValue: ({ component, value, emitUpdate }) => {
							component.components(
								value.map((v) => ({
									type: "option",
									content: v.label,
									attributes: { value: v.id },
								}))
							);
							emitUpdate();
						},
						// @ts-ignore
						properties: [{ name: "id" }, { name: "label" }],
					},
				],
			},
		},
	});
};

const headingComponent = function (editor, opts = {}) {
	const { Components, Blocks } = editor;

	const componentId = "heading";
	const componentClass = "gjs-heading";

	Blocks.add(
		componentId,
		{
			label: componentId,
			media: `
      <svg viewBox="0 0 24 24">
        <path d="M8.3 11.5h7.4V6.9l-.2-1.6a1 1 0 00-.5-.5c-.3-.2-.7-.3-1-.3h-.6v-.4h6.8v.4h-.6c-.4 0-.7.1-1 .3a1 1 0 00-.6.6L18 6.9v10.3c0 .8 0 1.3.2 1.6 0 .2.2.3.4.5.4.2.7.3 1.1.3h.6v.4h-6.8v-.4h.5c.7 0 1.2-.2 1.5-.6.2-.3.3-.9.3-1.8v-4.9H8.3v4.9l.1 1.6.5.5c.3.2.7.3 1 .3h.7v.4H3.7v-.4h.6c.7 0 1.1-.2 1.4-.6.2-.3.3-.9.3-1.8V6.9L6 5.3a1 1 0 00-.5-.5l-1-.3h-.7v-.4h6.9v.4H10c-.4 0-.8.1-1 .3a1 1 0 00-.6.6l-.1 1.5v4.6z"></path>
      </svg>
    `,
			content: { type: componentId, components: "Insert your text here" },
			...opts.block,
		},
		{ at: getBlockIndex(editor, "text") }
	);

	Components.addType(componentId, {
		extend: "text",
		isComponent: (el) =>
			elHasTagName(el, "H1", "H2", "H3", "H4", "H5", "H6"),
		model: {
			defaults: {
				emptyState: true,
				tagName: "h1",
				attributes: { class: componentClass },
				styles: `
          .${componentClass} {
            margin: 0;
          }
        `,
				traits: [
					{
						type: "select",
						options: [
							{ value: "h1", name: "One (largest)" },
							{ value: "h2", name: "Two" },
							{ value: "h3", name: "Three" },
							{ value: "h4", name: "Four" },
							{ value: "h5", name: "Five" },
							{ value: "h6", name: "Six (smallest)" },
						],
						label: "Size",
						name: "tagName",
						changeProp: true,
					},
				],
			},
		},
	});
};

const sectionComponent = function (editor, opts = {}) {
	const { Components, Blocks } = editor;

	Blocks.add(
		sectionId,
		{
			label: sectionId,
			media: `
      <svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M21 18H2V20H21V18M19 10V14H4V10H19M20 8H3C2.45 8 2 8.45 2 9V15C2 15.55 2.45 16 3 16H20C20.55 16 21 15.55 21 15V9C21 8.45 20.55 8 20 8M21 4H2V6H21V4Z" />
      </svg>
    `,
			content: { type: sectionId },
			...opts.block,
		},
		{ at: getBlockIndex(editor, blockIdColumn37) + 1 }
	);

	Components.addType(sectionId, {
		isComponent: (el) => elHasClassName(el, sectionClass),
		model: {
			defaults: {
				tagName: "section",
				emptyState: true,
				draggable: toEditorType("wrapper"),
				droppable: toEditorType(containerId),
				attributes: { class: sectionClass },
				components: { type: containerId },
				styles: `
          .${sectionClass} {
            display: flex;
            padding: 50px 0;
          }
        `,
			},
		},
	});

	Components.addType(containerId, {
		isComponent: (el) => elHasClassName(el, containerClass),
		model: {
			defaults: {
				emptyState: true,
				copyable: false,
				removable: false,
				draggable: false,
				attributes: { class: containerClass },
				styles: `
          .${containerClass} {
            width: 90%;
            margin: 0 auto;
            max-width: 1200px;
          }
        `,
			},
		},
	});
};

const resizableAngles = {
	ratioDefault: true,
	tc: false,
	cl: false,
	cr: false,
	bc: false,
};

const svgContent = `<svg viewBox="0 0 24 24">
  <path d="M16 9h3l-5 7m-4-7h4l-2 8M5 9h3l2 7m5-12h2l2 3h-3m-5-3h2l1 3h-4M7 4h2L8 7H5m1-5L2 8l10 14L22 8l-4-6H6z"></path>
</svg>`;

const iconComponent = function (editor, opts = {}) {
	const { Components, Blocks } = editor;

	const componentId = "icon";
	const componentClass = "gjs-icon";
	const componentAttrType = "data-type-icon";

	Blocks.add(componentId, {
		label: componentId,
		media: svgContent,
		content: { type: componentId },
		...opts.block,
	});

	Components.addType(componentId, {
		isComponent: (el) =>
			elHasClassName(el, componentClass) ||
			elHasAttribute(el, componentAttrType),
		model: {
			defaults: {
				droppable: false,
				attributes: {
					class: componentClass,
					[componentAttrType]: true,
				},
				resizable: resizableAngles,
				components: svgContent,
				traits: [
					"id",
					"title",
					{
						type: "code",
						label: "Content",
						// @ts-ignore
						typeProps: {
							language: "html",
							clean: true,
							padding: 5,
						},
						getValue({ component }) {
							return component.getInnerHTML();
						},
						setValue: debounce(({ editor, component, value }) => {
							const parsed = editor.Parser.parseHtml(value).html;
							const result = Array.isArray(parsed)
								? parsed[0]
								: parsed;
							const isSVG = result && result.tagName === "svg";
							isSVG && component.components(result);
						}, 500),
					},
				],
				styles: `
          .${componentClass} {
            display: inline-block;
            text-decoration: none;
            color: inherit;
            vertical-align: middle;
            fill: currentColor;
            width: 50px;
            height: 50px;
          }
        `,
			},

			init() {
				this.listenTo(
					this.components(),
					"change add",
					this.disableLayers
				);
				this.disableLayers();
			},

			disableLayers() {
				this.components().forEach((model) =>
					model.set("layerable", false)
				);
			},
		},
		view: {
			init() {
				const { model } = this;
				this.listenTo(
					model.components(),
					"change",
					this.disableChildren
				);
			},

			onRender() {
				this.disableChildren();
			},

			disableChildren() {
				this.model.components().forEach((model) => {
					const el = model.view?.el;
					if (el) {
						el.style.pointerEvents = "none";
					}
				});
			},
		},
	});
};

const pluginWeb = (editor) => {
	// TODO remove
	editor.Components.addType("trait-check", {
		model: {
			defaults: {
				traits: [
					"id",
					"title",
					{
						type: "select",
						name: "select-type",
						options: [
							{ id: "value1", label: "Value 1" },
							{ id: "value2", label: "Value 2" },
							{ id: "value3", label: "Value 3" },
						],
					},
					{
						type: "number",
						name: "number-type",
						// @ts-ignore TODO ts
						units: ["px", "rem", "%"],
					},
					{
						type: "checkbox",
						name: "checkbox-type",
					},
					{
						type: "color",
						name: "color-type",
					},
					{
						type: "button",
						name: "button-type",
						label: "Delete",
						command: "core:component-delete",
					},
				],
			},
		},
	});

	const basicBlocksProps = {
		category: "Basic",
		select: true,
		activate: true,
	};

	extendComponents(editor, {});
	headingComponent(editor, { block: basicBlocksProps });
	sectionComponent(editor, { block: basicBlocksProps });
	iconComponent(editor, { block: basicBlocksProps });
};

const ProjectType = {
	web: "web",
};

const PLUGIN_BY_PROJECT = {
	web: pluginWeb,
};

const PLUGINS_BY_PROJECT = {
	web: [
		gjsBlockBasic,
		gjsPluginForm,
		gjsParserPostCss,
		gjsCustomCode,
		gjsTailwind,
		grapesjsPluginExport,
		gjsNavbar,
	],
};

function getEditorPlugins(projectType) {
	return [...PLUGINS_BY_PROJECT[projectType], PLUGIN_BY_PROJECT[projectType]];
}

function getPluginsToLoad(projectType) {
	return [...getEditorPlugins(projectType)];
}

export {
	getEditorPlugins,
	getPluginsToLoad,
	PLUGIN_BY_PROJECT,
	PLUGINS_BY_PROJECT,
	ProjectType,
};
