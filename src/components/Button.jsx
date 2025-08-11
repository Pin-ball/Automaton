import { clsx } from "clsx";
import PropTypes from "prop-types";

export default function Button(props) {
  const {
    as,
    active = false,
    appearance = "default",
    disabled,
    className,
    children,
    ...rest
  } = props;

  const Component = as || "button";
  const type = rest.type || (Component === "button" ? "button" : undefined);
  const role = rest.role || (Component !== "button" ? "button" : undefined);

  let classes = "";
  switch (appearance) {
    case "primary":
      classes = clsx(
        className,
        "p-2 rounded-lg stroke-c-neutral-900",
        "bg-c-yellow-500 border border-c-yellow-100 active:bg-c-yellow-500"
      );
      break;

    case "link":
      classes = clsx(className, "p-2 rounded-lg", "disabled:bg-neutral-700", {
        "bg-c-yellow-500 active:bg-c-yellow-500": active,
      });
      break;

    default:
      classes = clsx(
        className,
        "px-4 py-2 rounded-lg border",
        "disabled:bg-neutral-800",
        {
          "bg-c-yellow-500 border-c-yellow-100 active:bg-c-yellow-500 stroke-c-neutral-900":
            active,
          "bg-c-neutral-800  border-c-neutral-600 active:bg-c-neutral-900":
            !active,
          "transition duration-100 active:scale-90": false,
        }
      );
      break;
  }

  return (
    <Component
      {...rest}
      role={role}
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      className={classes}
    >
      {children}
    </Component>
  );
}

Button.propTypes = {
  as: PropTypes.elementType,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  appearance: PropTypes.oneOf([
    "default",
    "primary",
    "link",
    "subtle",
    "ghost",
  ]),
  active: PropTypes.bool,
  children: PropTypes.node,
};
