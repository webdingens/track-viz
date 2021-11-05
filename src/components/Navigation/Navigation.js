import React from "react";
import { Link } from "react-router-dom";

import styles from "./Navigation.module.scss";

export default function Navigation() {
  return (
    <nav className={styles.navigation}>
      <ul>
        <li>
          <Link to="/">Track Editor</Link>
        </li>
        <li>
          <Link to="/3dview">3D View</Link>
        </li>
      </ul>
    </nav>
  );
}
