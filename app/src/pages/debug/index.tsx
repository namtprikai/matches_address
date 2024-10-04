import { FileUploader } from "../../components/ui/file-uploader/file-uploader";
import { Map } from "../../components/map";

export function Debug(): JSX.Element {
  return (
    <div>
      <h1>(開発用)</h1>
      <a href="#">Go to home page</a>
      <Map areas={[]} dataSetResultId={1} type="building" />
      <FileUploader
        onChange={() => {
          return;
        }}
        value={null}
      />
    </div>
  );
}
