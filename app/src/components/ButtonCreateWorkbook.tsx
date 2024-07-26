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
  import { Button } from "../components/Button";
  
const useStyles = makeStyles({
   input: {
    width: "100%",
   }
  });
  
export const ButtonCreateWorkbook = (): JSX.Element => {
    const styles = useStyles();

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
                <form >
                    <Input className={styles.input} name="name" />
                </form>
              </DialogContent>
              <DialogActions>
                <Button appearance="primary">保存</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
    )
}