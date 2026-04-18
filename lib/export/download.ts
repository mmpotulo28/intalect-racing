export const downloadTextFile = (fileName: string, content: string, contentType = "application/json"): void => {
	const blob = new Blob([content], { type: contentType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();

	URL.revokeObjectURL(url);
};
