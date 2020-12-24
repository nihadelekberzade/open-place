import React, {useState} from 'react';
import { makeStyles } from '@material-ui/styles';

import {Box} from "@material-ui/core";
import BlockIcon from "../../../../../assets/images/blockchain_icons/blockchain.svg";
import JSONViewer from "../JSONViewer/JSONViewer";
import {Link} from "react-router-dom";
import Value from "../Value";
import ExpandBtn from "../JSONViewer/ExpandBtn";

const useStyles = makeStyles({
  item: {
    color: "#6A7181",
    borderBottom: "1px solid #E4E8F2",
    padding: "15px",
    "& p": {
      margin: "5px 0",
    },
  },
  header: {
    fontWeight: 600,
    fontSize: "16px",
    margin: 0,
  },
  icon: {
    margin: "0 auto",
    width: "18px",
    height: "18px",
  },
  hash: {
    fontWeight: 500,
    color: "#ACB2BF",
    "& a": {
      fontWeight: 500,
      color: "#ACB2BF",
    },
  },
  content: {
    width: "100%",
    marginLeft: "24px",
  },
  link: {
    fontSize: "15px",
    color: "#2D69E0",
    textDecoration: "none",
    verticalAlign: "middle",
    "&:active": {
      color: "#2D69E0",
      textDecoration: "none",
    }
  },
});

export default ({link, block, title, icon, children}) => {
  const [jsonOpen, expandJson] = useState(false);
  const classes = useStyles();
  const {shortHash, signed_by} = block;

  let signedText;
  if (Array.isArray(signed_by)){
    signedText = signed_by.join(', ');
  } else {
    signedText = signed_by;
  }

  if (!icon) {
    icon = BlockIcon;
  }

  const onExpandClick = (e) => {
    e.preventDefault();
    expandJson(!jsonOpen);
  };

  return <div className={classes.item}>
    <Box display="flex" justifyContent="flex-start">
      <div className={classes.icon}>
        <img src={icon} alt="icon"/>
      </div>
      <div className={classes.content}>
        <Box display="flex" justifyContent="space-between">
          <h2 className={classes.header}>
            <Link to={link} className={classes.link}>{title}</Link>
          </h2>
          <div className={classes.hash}>
            <Link to={link} className={classes.link}>{shortHash}</Link>
          </div>
        </Box>

        {children}

        <Box display="flex" justifyContent="space-between">
          <ExpandBtn onClick={onExpandClick}/>
          <div>Signed by: <Value>{signedText}</Value></div>
        </Box>

        <JSONViewer open={jsonOpen} json={block}/>
      </div>
    </Box>
  </div>;
}

