import grapesjs, { Editor } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import { Modal } from "antd";

const HomePage2 = ({ initValue, setEditor }) => {
	const gjsOptions = {
		height: "100vh",
		storageManager: false,
		showOffsets: true,
		undoManager: { trackSelection: false },
		selectorManager: {
			componentFirst: true,
			escapeName: (name) =>
				`${name}`.trim().replace(/([^a-z0-9\w-:/]+)/gi, "-"),
		},
		projectData: {
			pages: [
				{
					name: "Home page",
					component: initValue || `<h1>Page builder</h1>`,
				},
			],
		},
	};

	const onEditor = (editor) => {
		editor.RichTextEditor.getConfig().custom = true;
		// setEditor(editor);
		console.log(editor);

		// Commands update
		editor.on("run:core:preview", () => {
			// dispatch(setPreview(true));
			// dispatch(setRightSidebar(false));
		});
		editor.on("stop:core:preview", () => {
			// dispatch(setPreview(false));
			// dispatch(setRightSidebar(true));
			// Update canvas tools post animation
			setTimeout(() => {
				editor.refresh();
			}, 151);
		});
	};

	return (
		<GjsEditor
			grapesjs={grapesjs}
			className="gjs-editor gjs-custom-editor"
			grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
			options={gjsOptions}
			onEditor={onEditor}
			// plugins={getPluginsToLoad(ProjectType.web)}
		>
			{/* Your components */}
		</GjsEditor>
	);
};

export default HomePage2;
