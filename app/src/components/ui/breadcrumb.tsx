import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemFUI,
  BreadcrumbDivider,
  BreadcrumbButton,
  type BreadcrumbButtonProps,
  makeStyles,
} from "@fluentui/react-components";
import { Fragment, type ReactNode } from "react";
import { ROUTES, withHash } from "../../routes";

const useStyles = makeStyles({
  root: {
    margin: `0 -6px`, // tokensを使ってマイナスマージンにする方法がわからないので、いったん固定値で指定
  },
});

type BreadcrumbBaseProps = {
  breadcrumbItem: ReactNode[];
};

export const BreadcrumbBase = ({
  breadcrumbItem = [],
}: BreadcrumbBaseProps): JSX.Element => {
  const styles = useStyles();

  return (
    <Breadcrumb aria-label="パンくずリスト" className={styles.root}>
      <BreadcrumbItemFUI>
        <BreadcrumbButton href={withHash(ROUTES.HOME)}>トップ</BreadcrumbButton>
      </BreadcrumbItemFUI>
      <BreadcrumbDivider />
      {breadcrumbItem.map((item, index) => {
        if (index !== breadcrumbItem.length - 1) {
          return (
            <Fragment key={index}>
              {item}
              <BreadcrumbDivider />
            </Fragment>
          );
        }
        return item;
      })}
    </Breadcrumb>
  );
};

export const BreadcrumbItem = (props: BreadcrumbButtonProps): JSX.Element => {
  if ("href" in props && props.href) {
    return (
      <BreadcrumbItemFUI>
        <BreadcrumbButton {...props} href={withHash(props.href)} />
      </BreadcrumbItemFUI>
    );
  }

  return (
    <BreadcrumbItemFUI>
      <BreadcrumbButton {...props} />
    </BreadcrumbItemFUI>
  );
};
