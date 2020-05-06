import React from 'react'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        padding: '4px'
    },
    containerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        height: '90%'
    },
    compPercentageWrapper: {
        display: 'flex',
        justifyContent: 'center'
    },
    graphWrapper: {
        display: 'flex',
        width: '50%',
        height: '100%'
    }
}))


const GraphContainer = ({ concepts, links }) => {
    const { graphWrapper } = useStyles()

    return (
        <div className={graphWrapper} >
            <p> TBA </p> 
        </div>
    )
}

const GraphSplitter = () => <div style={{borderLeft: '1px solid black'}} />

const ComparisonView = ({ urlPrefix, workspaceId, compWorkspaceId }) => {

    const { wrapper, containerWrapper, compPercentageWrapper } = useStyles()
    const workspaceQuery = null
    const compWorkspaceQuery = null

    return (
        <div className={wrapper}>
            <div className={compPercentageWrapper}>
                <h1> 78 % </h1>  
            </div>
            <div className={containerWrapper}>
                <GraphContainer/>
                <GraphSplitter/>
                <GraphContainer/>
            </div>
        </div>
    )
}

export default ComparisonView