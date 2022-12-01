import React, { useEffect, useState } from "react";
import styles from "./Home.module.scss";

import grapesjs from "grapesjs";
import gjsPresetsWebpage from "grapesjs-preset-webpage";
import gjsBlocksBasic from "grapesjs-blocks-basic";
import gjsCountdown from "grapesjs-component-countdown";

function HomePage() {
	const [editor, setEditor] = useState(null);
	useEffect(() => {
		const editor = grapesjs.init({
			container: "#editor",
			plugins: [gjsPresetsWebpage, gjsBlocksBasic, gjsCountdown],
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
				gjsCountdown: {

				},
			},
		});
		setEditor(editor);
	}, []);
	return (
		<div className={styles.home}>
			<div id="editor"></div>
		</div>
	);
}

export default HomePage;