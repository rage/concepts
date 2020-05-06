import React from 'react'
import { makeStyles } from '@material-ui/core'
import { useQuery } from '@apollo/react-hooks'
import { WORKSPACE_COMPARISON } from '../../graphql/Query'

import LoadingBar from '../../components/LoadingBar'
import ConceptLink from '../../components/ConceptLink'
import ConceptNode from './ConceptNode'

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


const GraphContainer = ({ workspace }) => {
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
    
    const workspaceQuery = useQuery(WORKSPACE_COMPARISON, { 
        variables: { workspaceId, compWorkspaceId }
    })

    if (!workspaceQuery.data) {
        return <LoadingBar id='comparison-view' />
    }

    const { workspace, compWorkspace } = workspaceQuery.data

    return (
        <div className={wrapper}>
            <div className={compPercentageWrapper}>
                <h1> 78 % </h1>  
            </div>
            <div className={containerWrapper}>
                <GraphContainer workspace={workspace}/>
                <GraphSplitter/>
                <GraphContainer workspace={compWorkspace}/>
            </div>
        </div>
    )
}

export default ComparisonView