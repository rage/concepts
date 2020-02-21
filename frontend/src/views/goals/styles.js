import { makeStyles } from '@material-ui/core/styles'

export const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: '1408px',
    margin: '0 auto',
    display: 'grid',
    overflow: 'hidden',
    gridGap: '16px',
    gridTemplate: `"header  header header" 56px
                   "courses space  goals"  1fr
                  / 1fr     128px  1fr`,
    '@media screen and (max-width: 1440px)': {
      width: 'calc(100% - 32px)'
    }
  },
  card: {
    ...theme.mixins.gutters(),
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  courses: {
    gridArea: 'courses'
  },
  goals: {
    gridArea: 'goals'
  },
  list: {
    overflow: 'auto'
  },
  title: {
    gridArea: 'header'
  },
  activeCircle: {
    zIndex: 2
  },
  circle: {
    zIndex: 2
  },
  listItemContainer: {
    padding: '0 16px',
    '&:hover': {
      '& $hoverButton': {
        visibility: 'visible'
      }
    }
  },
  hoverButton: {
    visibility: 'hidden'
  }

}))
