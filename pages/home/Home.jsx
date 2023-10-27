import React, { useEffect, useState } from "react";
import styles from "./Home.module.scss";

import grapesjs from "grapesjs";
import gjsPresetsWebpage from "grapesjs-preset-webpage";
import gjsBlocksBasic from "grapesjs-blocks-basic";
import gjsCountdown from "grapesjs-component-countdown";
import gjsForms from "grapesjs-plugin-forms";
import gjsTooltip from "grapesjs-tooltip";
import { ProjectType, getEditorPlugins } from "./plugin";
// import tabs from "grapesjs-tabs";

function HomePage() {
	const [editor, setEditor] = useState(null);

	useEffect(() => {
		const editor = grapesjs.init({
			container: "#editor",
			// plugins: [
			// 	gjsPresetsWebpage,
			// 	gjsBlocksBasic,
			// 	gjsCountdown,
			// 	gjsForms,
			// 	gjsTooltip,
			// ],
			plugins: getEditorPlugins(ProjectType.web),
			pluginsOpts: {
				gjsPresetsWebpage: {
					modalImportTitle: "Import Template",
					modalImportButton: "Import",
					modalImportLabel: "",
					modalImportContent: (editor) => {
						editor.getHtml();
						editor.getCss();
					},
				},
				gjsBlocksBasic: {},
				gjsCountdown: {},
				gjsForms: {},
				gjsTooltip: {},
			},
			layerManager: {
				// If the `root` is not specified or the component element is not found,
				// the main wrapper component will be used.
				root: "#my-custom-root",
				sortable: false,
				hidable: false,
			},
			projectData: {
				pages: [
					{
						name: "Home page",
						component:
							localStorage.getItem("grapesjs_content") ||
							`<h1>Page builder</h1>`,
					},
				],
			},
		});
		setEditor(editor);
	}, []);
	// Save the editor's content to local storage
	const saveContent = () => {
		if (editor) {
			const content = editor.getHtml();
			localStorage.setItem("grapesjs_content", content);
		}
	};
	return (
		<div className={styles.home}>
			<button onClick={saveContent}>Save Content</button>
			<div id="editor"></div>
		</div>
	);
}

export default HomePage;
