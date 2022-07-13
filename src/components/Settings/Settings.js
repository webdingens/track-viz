import React, { useState } from "react";
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
  const [currentTab, setCurrentTab] = useState(0);
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

      {/* <nav className={styles.tabs}>
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
              Tab2
            </button>
          </li>
          <li>
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
          </li>
        </ul>
      </nav> */}

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

      {/* {currentTab === 1 ? (
        <section className={styles.section}>
          <h1>Track 2D</h1>
        </section>
      ) : null} */}
    </div>
  );
};

Settings.displayName = "Settings";
export default Settings;
