import FilePreview from "./FilePreview";

export default function SelectedFiles({
  files,
  setFiles,
}) {
  if (!files.length) return null;

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">
        Selected Files
      </h2>

      {files.map((file, index) => (
        <FilePreview
          key={index}
          file={file}
          onRemove={() => removeFile(index)}
        />
      ))}
    </div>
  );
}