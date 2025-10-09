import React from "react";
import "../../styles/common/Button.css";

const Button = ({
  children,
  type = "button",
  loading = false,
  disabled = false,
  variant = "primary", // "primary" | "outline" | "ghost"
  fullWidth = false,
  onClick,
  className = "",
  ...rest
}) => {
  const classes = [
    "button",
    `button-${variant}`,
    fullWidth ? "button-block" : "",
    loading ? "loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      <span className="button-text">{children}</span>
      <span className="shine" aria-hidden="true" />
    </button>
  );
};

export default Button;
