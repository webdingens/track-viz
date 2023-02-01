import styles from "./RichtextView.module.scss";

function RichtextView({ content }) {
  if (!content) return null;
  return (
    <div
      className={styles.richtextView}
      dangerouslySetInnerHTML={{ __html: content ?? "" }}
    ></div>
  );
}

export default RichtextView;
