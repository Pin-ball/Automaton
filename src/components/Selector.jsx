import { ChevronDownIcon } from "@heroicons/react/24/outline/index.js";
import { clsx } from "clsx";
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const Context = createContext(null);

function Selector({ children, active, activeOption, action, className }) {
  let inputRef = useRef(null);
  let [open, setOpen] = useState(false);

  return (
    <button
      ref={inputRef}
      onClick={() => action(activeOption)}
      className={clsx(
        "max-w-36 pl-4 py-2 rounded-lg border border-c-neutral-600 grow flex justify-between align-center relative",
        className,
        active
          ? "bg-c-yellow-500 active:bg-c-yellow-500 stroke-c-neutral-900 fill-c-neutral-900"
          : "bg-c-neutral-800 active:bg-c-neutral-900"
      )}
    >
      <Context.Provider
        value={{ open, setOpen, inputRef, active, activeOption, action }}
      >
        {children}
      </Context.Provider>
    </button>
  );
}

Selector.displayName = "Selector";
Selector.propTypes = {
  children: PropTypes.node,
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  action: PropTypes.func,
  className: PropTypes.string,
};

function Button(props) {
  const { children } = props;

  return children;
}

Button.displayName = "Selector - Button";
Button.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  className: PropTypes.string,
};

function Options({ children }) {
  const { open, setOpen, inputRef } = useContext(Context);

  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target))
        setOpen(false);
    };

    if (open) {
      window.addEventListener("click", handler);

      return () => {
        window.removeEventListener("click", handler);
      };
    }
  }, [open]);

  function toggle(e) {
    e.stopPropagation();
    setOpen((e) => !e);
  }

  return (
    <>
      <span className="flex items-center px-2 my-auto group" onClick={toggle}>
        <ChevronDownIcon className="w-4 group-hover:mt-1.5 transition-all duration-150 stroke-inherit" />
      </span>
      {open && (
        <ul className="absolute left-0 z-10 py-1 border rounded-lg top-11 min-w-56 bg-neutral-900 border-c-neutral-600 font-extralight">
          {children}
        </ul>
      )}
    </>
  );
}

Options.displayName = "Selector - Options";
Options.propTypes = {
  children: PropTypes.node,
};

function Option({ children, value }) {
  const { active, activeOption, action } = useContext(Context);
  const isActiveOption = activeOption === value;

  function select(e) {
    e.stopPropagation();
    action(value);
  }

  return (
    <li
      onClick={select}
      className={clsx("px-2 py-0.5 my-1 mx-2 rounded", {
        "bg-c-yellow-500 active:bg-c-yellow-500 text-c-neutral-900":
          isActiveOption && active,
        "bg-c-neutral-500 hover:bg-c-neutral-600": isActiveOption && !active,
        "active:bg-c-neutral-700 hover:bg-c-neutral-600": !isActiveOption,
        "transition duration-100 active:scale-90": false,
      })}
    >
      {typeof children === "function" ? children(active) : children}
    </li>
  );
}

Option.displayName = "Selector - Option";
Option.propTypes = {
  children: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  active: PropTypes.bool,
};

Selector.Button = Button;
Selector.Options = Options;
Selector.Option = Option;

export default Selector;
