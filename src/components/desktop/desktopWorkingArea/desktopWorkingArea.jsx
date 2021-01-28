import React, { useEffect, useRef, useState } from "react";
import DesktopIcon from "./desktopIcon";
import ContextMenu from "./ContextMenu";
import { connect } from "react-redux";
import Explorer from "../explorer/explorer";
import FOLDER_IMAGE from "../../../assets/icons/folder.svg";
import FILE_IMAGE from "../../../assets/icons/file.svg";
import { createActivity } from "../../../actions/createActivityAction";
import "../../../assets/desktop/desktopWorkingArea.css";

const LinkFooter = ({ system }) => {
  return (
    <div className="link-footer">
      Open in new Tab:{" "}
      <a href={system.link} target="_blank" rel="noreferrer">
        {system.link}
      </a>
    </div>
  );
};
const IframeContainer = ({ system }) => {
  return (
    <iframe
      src={system.link}
      title={system.name}
      className="portfolio-container-iframe"
    />
  );
};

const DesktopWorkingArea = ({ activityList, fileSystem, createActivity }) => {
  const desktopWorkingRef = useRef(null);
  const [contextShown, setContextShown] = useState(false);
  const [contextPosition, setContextPosition] = useState({ top: 0, left: 0 });
  const contextMenuHeight = 300;

  const iconChanger = (system) => {
    return system.icon
      ? system.icon
      : system.type === "folder"
      ? FOLDER_IMAGE
      : FILE_IMAGE;
  };
  const startTask = (system) => {
    if (system.type === "file") {
      if (system.link) {
        if (system.inPage) {
          createActivity({
            name: system.name,
            newApp: true,
            image: iconChanger(system),
            footer: <LinkFooter system={system} />,
            child: () => <IframeContainer system={system} />,
          });
        } else {
          window.open(system.link);
        }
      }
    }
  };
  useEffect(() => {
    desktopWorkingRef.current.addEventListener("contextmenu", (e) => {
      try {
        e.preventDefault();
        setContextShown(false);
        setTimeout(() => {
          setContextShown(true);
          let posX = e.clientX;
          let posY = e.clientY;
          let winWidth = window.innerWidth;
          let winHeight = window.innerHeight;
          if (winWidth - 235 < posX) posX = winWidth - 235;
          if (winHeight - (contextMenuHeight + 5) < posY)
            posY = winHeight - (contextMenuHeight + 5);
          setContextPosition({ top: posY, left: posX });
        }, 50);
      } catch (err) {
        return null;
      }
    });
  }, []);
  return (
    // No Parent component Other than the main div
    <div className="desktop-area-container" ref={desktopWorkingRef}>
      <ContextMenu
        isOpen={contextShown}
        close={() => setContextShown(false)}
        top={contextPosition.top}
        left={contextPosition.left}
        contextArray={[]}
        height={contextMenuHeight}
      />
      {activityList.map(
        (activity, index) =>
          activity && (
            <Explorer
              explorerIndex={index}
              activity={activity}
              key={`explorer-${index}`}
            />
          )
      )}
      {fileSystem[0].child.map(
        (system, index) =>
          system && (
            <DesktopIcon
              key={`desktop-icon-${index}`}
              icon={iconChanger(system)}
              name={system.name}
              width={"60px"}
              clickTask={() => startTask(system)}
            />
          )
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  activityList: state.activityReducers.activity,
  fileSystem: state.fileSystemReducers,
});

export default connect(mapStateToProps, { createActivity })(DesktopWorkingArea);
