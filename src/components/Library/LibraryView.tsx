import { PropsWithoutRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import { FiPlus, FiMinus } from "react-icons/fi";

import {
  LibraryData,
  Situation as SituationType,
  SkaterType,
} from "../../types/LibraryData";
import RichtextView from "./RichtextView";
import TrackGeometry from "../Track/TrackGeometry";
import { setCurrentTrack } from "../../app/reducers/currentTrackSlice";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import {
  getSkatersWDPInBounds,
  getSkatersWDPInPlayPackSkater,
  getSkatersWDPPivotLineDistance,
  PACK_MEASURING_METHODS,
} from "../../utils/packFunctions";
import styles from "./LibraryView.module.scss";
import "./AccordionStyles.module.scss";

type LibraryViewProps = PropsWithoutRef<{ data: LibraryData }>;

function LibraryView({ data }: LibraryViewProps) {
  const dispatch = useDispatch();
  const settings = useSelector(selectGeneralSettings);

  const onLoadToCurrentTrack = (situation: SituationType) => {
    dispatch(
      setCurrentTrack({
        skaters: situation.skaters,
        refs: situation.refs,
      })
    );
  };

  /**
   * Adding inBounds, pivotLineDist for pack computations. Imported skaters are missing these.
   */
  const addDerivedPropertiesToSkaters = (skaters: SkaterType[]) => {
    let ret = getSkatersWDPInBounds(skaters);
    ret = getSkatersWDPPivotLineDistance(ret);
    if (settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR) {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.SECTOR,
      });
    } else {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.RECTANGLE,
      });
    }
    return ret;
  };

  return (
    <div className={styles.libraryView}>
      <h2>Library</h2>
      {!!data.title && (
        <section>
          <h3>{data.title}</h3>
        </section>
      )}
      {!!data.description && (
        <section>
          <RichtextView content={data.description} />
        </section>
      )}
      <section>
        <h3>Sequences</h3>
        {data.sequences.length > 0 && (
          <Accordion allowZeroExpanded>
            {data.sequences.map((sequence, idx) => (
              <AccordionItem key={sequence.id}>
                <AccordionItemState>
                  {({ expanded }) => (
                    <>
                      <AccordionItemHeading
                        className={classNames({
                          accordion__heading: true,
                          "accordion__heading--expanded": expanded,
                        })}
                      >
                        <AccordionItemButton>
                          <span>
                            {sequence.title
                              ? sequence.title
                              : `Sequence ${idx + 1} (no title)`}
                          </span>
                          <span>{expanded ? <FiMinus /> : <FiPlus />}</span>
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        {!!sequence.description && (
                          <div className={styles.accordionIntro}>
                            <RichtextView content={sequence.description} />
                          </div>
                        )}

                        {sequence.sequence.length > 0 && (
                          <ul className={styles.situationList}>
                            {sequence.sequence.map((situation) => (
                              <li key={situation.id}>
                                {!!situation.title && <p>{situation.title}</p>}
                                {!!situation.description && (
                                  <RichtextView
                                    content={situation.description}
                                  />
                                )}
                                {!!(
                                  situation.title || situation.description
                                ) && <hr />}
                                {!situation.empty && (
                                  <>
                                    <TrackGeometry
                                      skaters={addDerivedPropertiesToSkaters(
                                        situation.skaters
                                      )}
                                      isPreview={true}
                                      updatePack={true}
                                      style={{ maxHeight: "200px" }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onLoadToCurrentTrack(situation)
                                      }
                                      title="Load"
                                    >
                                      Load onto Track
                                    </button>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </AccordionItemPanel>
                    </>
                  )}
                </AccordionItemState>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </div>
  );
}

export default LibraryView;
