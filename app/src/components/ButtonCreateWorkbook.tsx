import {
    AddFilled,
    Dismiss24Regular
  } from "@fluentui/react-icons";
  import { 
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Input,
    makeStyles,
   } from "@fluentui/react-components";
   import { type FormProps } from "react-router-dom";
  import { Button } from "../components/Button";
  
  
const useStyles = makeStyles({
   input: {
    width: "100%",
   }
  });
  
export const ButtonCreateWorkbook = (): JSX.Element => {
    const styles = useStyles();

    /** フォーム制御についてはあとで考える */
    const handleSubmit: FormProps["onSubmit"] = (e) => {
        e.preventDefault();
        const asyncSubmit = async (): Promise<void> => {
          const data = Object.fromEntries(new FormData(e.currentTarget));
          console.log("submit")
          await window.ipcRenderer.invoke("insertWorkbooks", {
            title: "ワークブック1",
          });
        };
        asyncSubmit().catch(console.error);
    };

    return (
        <Dialog >
          <DialogTrigger disableButtonEnhancement>
            <Button icon={<AddFilled />}>新規ワークブック作成</Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle
                action={
                    <DialogTrigger action="close">
                    <Button
                        appearance="subtle"
                        aria-label="close"
                        icon={<Dismiss24Regular />}
                    />
                    </DialogTrigger>
                }
              >ワークブック名</DialogTitle>
              <DialogContent>
                <form id="create-workbook" onSubmit={handleSubmit}>    
                    <Input className={styles.input} name="name" />
                </form>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary" form="create-workbook" type="submit">保存</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
    )
}