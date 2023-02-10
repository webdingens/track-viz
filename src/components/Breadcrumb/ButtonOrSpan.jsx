import styles from "./ButtonOrSpan.module.scss";

function ButtonOrSpan({ onClick, isButton, children, title, className }) {
  if (isButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={[styles.buttonOrSpan, className].join(" ")}
      >
        {children}
      </button>
    );
  } else {
    return <span className={className}>{children}</span>;
  }
}

export default ButtonOrSpan;
