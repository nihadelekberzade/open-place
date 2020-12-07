import React, {useEffect, useState} from 'react';

import {Box, Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import { usePromiseTracker } from "react-promise-tracker";

import { getBlocks } from "../../api/data";
import BlockItem from "./list-items/BlockItem";
import Breadcrumbs from "./Breadcrumbs";
import Loader from "../Loader";

const useStyles = makeStyles({
  h1: {
    marginBottom: "20px",
    fontSize: "40px",
    letterSpacing: "0.01em",
  },
  list: {
    borderTop: "1px solid #E4E8F2",
    position: "relative",
    minHeight: "200px",
    paddingBottom: "20px",
  },
});

const BLOCKS_PER_PAGE = 3;

export default () => {
  const [objectsList, setObjects] = useState([]);
  const [lastBlock, setlastBlock] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoaded, setLoaded] = useState(false);
  const classes = useStyles();

  const { promiseInProgress } = usePromiseTracker();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let limit = BLOCKS_PER_PAGE;
        if (lastBlock.length) {
          limit = limit + 1;
        }

        const { blocks } = await getBlocks({
          limit,
          to: lastBlock,
        });

        if (!!lastBlock) {
          blocks.shift();
        }

        if (!isLoaded) {
          setLoaded(true);
        }

        setHasMore(blocks.length > 0);
        setObjects((existsBlocks) => [
          ...existsBlocks,
          ...blocks,
        ]);
      } catch (e) {
        console.warn('Network request failed');
      }
    };

    fetchData();
  }, [lastBlock]);

  const getMore = () => {
    const [ last ] = objectsList.slice(-1);
    setlastBlock(last.hash);
  }

  let content;
  if (objectsList.length) {
    content = objectsList.map((entity) => <BlockItem key={entity.block_id} entity={entity}/>)
  } else {
    content = (<Box display="flex" justifyContent="center"><p>No entities available</p></Box>);
  }

  if (!isLoaded || promiseInProgress) {
    return <Loader/>;
  }

  const crumbs = [
    {url: '/data', text: 'Data'},
    {url: '/data/blocks', text: 'Blocks'},
  ];

  return <div className={classes.list}>
      <Breadcrumbs crumbs={crumbs}/>
      <h1 className={classes.h1}>Blocks</h1>

      {content}

      {hasMore && <Box display="flex" justifyContent="center">
        <Button onClick={getMore}>Show more</Button>
      </Box>}
    </div>;
};
