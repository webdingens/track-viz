import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import {
  selectGeneralSettings,
  setSetting,
} from "../../app/reducers/settingsGeneralSlice";

import { PACK_MEASURING_METHODS } from "../../utils/packFunctions";

import { GrFormClose } from "react-icons/gr";

import styles from "./Settings.module.scss";

const Settings = () => {
  const settings = useSelector(selectGeneralSettings);
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(1);

  const outputContainer = useRef();

  // useEffect(() => {
  //   const haveEvents = "ongamepadconnected" in window;
  //   const controllers = {};

  //   function connecthandler(e) {
  //     addgamepad(e.gamepad);
  //   }

  //   function addgamepad(gamepad) {
  //     controllers[gamepad.index] = gamepad;
  //     rendergamepad(gamepad);
  //   }

  //   function rendergamepad(gamepad) {
  //     const d = document.createElement("div");
  //     d.setAttribute("id", `controller${gamepad.index}`);

  //     const t = document.createElement("h1");
  //     t.textContent = `gamepad: ${gamepad.id}`;
  //     d.appendChild(t);

  //     const b = document.createElement("div");
  //     b.className = "buttons";
  //     for (let i = 0; i < gamepad.buttons.length; i++) {
  //       const e = document.createElement("span");
  //       e.className = "button";
  //       e.textContent = i;
  //       b.appendChild(e);
  //     }

  //     d.appendChild(b);

  //     const a = document.createElement("div");
  //     a.className = "axes";

  //     for (let i = 0; i < gamepad.axes.length; i++) {
  //       const p = document.createElement("progress");
  //       p.className = "axis";
  //       p.setAttribute("max", "2");
  //       p.setAttribute("value", "1");
  //       p.textContent = i;
  //       a.appendChild(p);
  //     }

  //     d.appendChild(a);

  //     // See https://github.com/luser/gamepadtest/blob/master/index.html
  //     const start = document.getElementById("start");
  //     if (start) {
  //       start.style.display = "none";
  //     }

  //     outputContainer.current.appendChild(d);
  //     requestAnimationFrame(updateStatus);
  //   }

  //   function disconnecthandler(e) {
  //     removegamepad(e.gamepad);
  //   }

  //   function removegamepad(gamepad) {
  //     const d = document.getElementById(`controller${gamepad.index}`);
  //     outputContainer.current.removeChild(d);
  //     delete controllers[gamepad.index];
  //   }

  //   function updateStatus() {
  //     if (!haveEvents) {
  //       scangamepads();
  //     }

  //     for (const j in controllers) {
  //       const controller = controllers[j];
  //       const d = document.getElementById(`controller${j}`);
  //       const buttons = d.getElementsByClassName("button");

  //       for (let i = 0; i < controller.buttons.length; i++) {
  //         const b = buttons[i];
  //         let val = controller.buttons[i];
  //         let pressed = val === 1.0;
  //         if (typeof val === "object") {
  //           pressed = val.pressed;
  //           val = val.value;
  //         }

  //         const pct = `${Math.round(val * 100)}%`;
  //         b.style.backgroundSize = `${pct} ${pct}`;

  //         if (pressed) {
  //           b.className = "button pressed";
  //         } else {
  //           b.className = "button";
  //         }
  //       }

  //       const axes = d.getElementsByClassName("axis");
  //       for (let i = 0; i < controller.axes.length; i++) {
  //         const a = axes[i];
  //         a.textContent = `${i}: ${controller.axes[i].toFixed(4)}`;
  //         a.setAttribute("value", controller.axes[i] + 1);
  //       }
  //     }

  //     requestAnimationFrame(updateStatus);
  //   }

  //   function scangamepads() {
  //     const gamepads = navigator.getGamepads();
  //     for (const gamepad of gamepads) {
  //       if (gamepad) {
  //         // Can be null if disconnected during the session
  //         if (gamepad.index in controllers) {
  //           controllers[gamepad.index] = gamepad;
  //         } else {
  //           addgamepad(gamepad);
  //         }
  //       }
  //     }
  //   }

  //   window.addEventListener("gamepadconnected", connecthandler);
  //   window.addEventListener("gamepaddisconnected", disconnecthandler);

  //   if (!haveEvents) {
  //     setInterval(scangamepads, 500);
  //   }
  // }, []);

  if (!settings.settingsVisible) return null;

  return (
    <div className={styles.settings}>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() =>
          dispatch(
            setSetting({
              key: "settingsVisible",
              value: false,
            })
          )
        }
      >
        <GrFormClose />
      </button>

      <h2 className={styles.headline}>Settings</h2>

      <nav className={styles.tabs}>
        <ul>
          <li>
            <button
              className={classNames({
                [styles.tab]: true,
                [styles["tab--active"]]: currentTab === 0,
              })}
              onClick={() => {
                setCurrentTab(0);
              }}
            >
              Pack Computation
            </button>
          </li>
          <li>
            <button
              className={classNames({
                [styles.tab]: true,
                [styles["tab--active"]]: currentTab === 1,
              })}
              onClick={() => {
                setCurrentTab(1);
              }}
            >
              Controls
            </button>
          </li>
          {/* <li>
            <button
              className={classNames({
                [styles.tab]: true,
                [styles["tab--active"]]: currentTab === 2,
              })}
              onClick={() => {
                setCurrentTab(2);
              }}
            >
              Tab 3
            </button>
          </li> */}
        </ul>
      </nav>

      {currentTab === 0 ? (
        <section className={styles.section}>
          <h1>Pack Computation</h1>
          <p>Pack Computation Method</p>
          <div>
            <label>
              <input
                type="radio"
                name="packMeasuringMethod"
                checked={
                  settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR
                }
                onChange={() => {
                  dispatch(
                    setSetting({
                      key: "packMeasuringMethod",
                      value: PACK_MEASURING_METHODS.SECTOR,
                    })
                  );
                }}
                value={PACK_MEASURING_METHODS.SECTOR}
              />
              Sector / Slice / Pizza (NURDS)
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="packMeasuringMethod"
                checked={
                  settings.packMeasuringMethod ===
                  PACK_MEASURING_METHODS.RECTANGLE
                }
                onChange={() => {
                  dispatch(
                    setSetting({
                      key: "packMeasuringMethod",
                      value: PACK_MEASURING_METHODS.RECTANGLE,
                    })
                  );
                }}
                value={PACK_MEASURING_METHODS.RECTANGLE}
              />
              Rectangle / Lasagna (WFTDA)
            </label>
          </div>
          <hr />
          <p>Engagement Zone Overlay</p>
          <div>
            <label>
              <input
                type="checkbox"
                name="showEngagementZoneOtherMethod"
                checked={settings.showEngagementZoneOtherMethod}
                onChange={(evt) => {
                  dispatch(
                    setSetting({
                      key: "showEngagementZoneOtherMethod",
                      value: evt.target.checked,
                    })
                  );
                }}
              />
              Overlay other method to compare
            </label>
            {settings.showEngagementZoneOtherMethod ? (
              <p>
                Active Overlay:{" "}
                {settings.packMeasuringMethod ===
                PACK_MEASURING_METHODS.RECTANGLE
                  ? "Sector / Slice / Pizza (NURDS)"
                  : "Rectangle / Lasagna (WFTDA)"}
              </p>
            ) : null}
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="showEngagementZoneEndRectangles"
                checked={settings.showEngagementZoneEndRectangles}
                onChange={(evt) => {
                  dispatch(
                    setSetting({
                      key: "showEngagementZoneEndRectangles",
                      value: evt.target.checked,
                    })
                  );
                }}
              />
              Show end of engagement zone rectangles
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="showAllClosestBlockerRectangles"
                checked={settings.showAllClosestBlockerRectangles}
                onChange={(evt) => {
                  dispatch(
                    setSetting({
                      key: "showAllClosestBlockerRectangles",
                      value: evt.target.checked,
                    })
                  );
                }}
              />
              Show all closest blockers rectangles
            </label>
          </div>
          {settings.packMeasuringMethod === PACK_MEASURING_METHODS.RECTANGLE ? (
            <>
              <hr />
              <p>Pack Overlay</p>
              {/* <div>
                <label>
                  <input
                    type="checkbox"
                    name="showPackAllSkaterRectangles"
                    checked={settings.showPackAllSkaterRectangles}
                    onChange={(evt) => {
                      dispatch(
                        setSetting({
                          key: "showPackAllSkaterRectangles",
                          value: evt.target.checked,
                        })
                      );
                    }}
                  />
                  Show all skater rectangles of pack skaters
                </label>
              </div> */}
              <div>
                <label>
                  <input
                    type="checkbox"
                    name="showPackEndRectangles"
                    checked={settings.showPackEndRectangles}
                    onChange={(evt) => {
                      dispatch(
                        setSetting({
                          key: "showPackEndRectangles",
                          value: evt.target.checked,
                        })
                      );
                    }}
                  />
                  Show pack end rectangles
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="showPackMethodDuringRectangleMethod"
                    checked={
                      settings.showPackMethodDuringRectangleMethod ===
                      PACK_MEASURING_METHODS.SECTOR
                    }
                    onChange={() => {
                      dispatch(
                        setSetting({
                          key: "showPackMethodDuringRectangleMethod",
                          value: PACK_MEASURING_METHODS.SECTOR,
                        })
                      );
                    }}
                    value={PACK_MEASURING_METHODS.SECTOR}
                  />
                  Show pack using sector method (scoring view)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="showPackMethodDuringRectangleMethod"
                    checked={
                      settings.showPackMethodDuringRectangleMethod ===
                      PACK_MEASURING_METHODS.RECTANGLE
                    }
                    onChange={() => {
                      dispatch(
                        setSetting({
                          key: "showPackMethodDuringRectangleMethod",
                          value: PACK_MEASURING_METHODS.RECTANGLE,
                        })
                      );
                    }}
                    value={PACK_MEASURING_METHODS.RECTANGLE}
                  />
                  Show pack using outermost rectangles&apos; outer edge
                </label>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {currentTab === 1 ? (
        <section className={styles.section}>
          <h1>Controls</h1>
          <div ref={outputContainer}></div>
        </section>
      ) : null}
    </div>
  );
};

Settings.displayName = "Settings";
export default Settings;
